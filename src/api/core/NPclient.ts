import type {
  AgentMessage,
  NPResponse,
  SessionEndedResponse,
  SessionStartedResponse,
  ApiError,
  StartSessionRequestParams,
  PushClientMessageRequest,
  StartSessionClientInfo,
  IsSessionActiveResponse,
  ClientCapability,
  AssistantInfo,
  ManualData,
} from "../types/NPJWI";
import NPJWIComm_HTTP from "./NPJWIComm_HTTP";
import { type NPJWICommType } from "./NPJWIComm_HTTP";
import { m_config} from "./NPClientConfig";
import { ErrorClassifier, ErrorCategory } from "./ErrorClassifier";
import { logger, LOG_LEVEL } from "./logger";

import {NPContentParser, type UIAgentMessage} from "../utils/NPContentParser";
import { SettingsManager, type UserSettings } from "./SettingsManager";

export interface NPClientEvents {
  "session:started": SessionStartedResponse;
  "session:ended": SessionEndedResponse;
  "message": UIAgentMessage;
  // Unified error event with category
  "error": Partial<ApiError & {
    category:ErrorCategory;
    timestamp: Date;
  }>;
  "state:changed": Record<string, any>;
  "domain:changed": string | null;
  "agent:state:changed": any;
  "hints:changed": any[];
  "SetAgentMessageLoading": boolean;
  "SetSessionConnectionLoading": boolean;
  // For Manual Viewer, could be empty array.
  "assistant:info:manualLoaded": ManualData[];
  "wifi:off": {
    timestamp: Date;
  };
  "wifi:on": {
    sessionValid: boolean;
    timestamp: Date;
  };
}

export interface NPClientConfig {
  NPServerURL: string;
  sysInfo?: string;
  autoReconnect?: boolean;
  maxRetries?: number;
  userLanguage?: string;
  receiveTimeout?: number;
  sendTimeout?: number;
  [key: string]: any;
}

import { EventEmitter } from "./EventEmitter";

class NPClient extends EventEmitter<NPClientEvents> {
  private NPJWIComm: NPJWICommType | null = null;
  private initialized: boolean = false;
  private manualData: ManualData[] = [];

  // flattened configuration
  public NPServerURL: string = "";
  public sysInfo: string = "";
  public autoReconnect: boolean = true;
  
  public receiveTimeout: number = 45;
  public sendTimeout: number = 15000;

  // flattened state
  public m_sessionID: string | null = null;
  public m_connected: boolean = false;
  public connecting: boolean = false;
  public lastAgentMessageID: string | null = null;
  public remoteMessageQueuing: "Inactive" | "SDN" | undefined;
  public contextStates: Record<string, any> = {};
  public agentState: any = null;
  public domain: string | null = null;
  public maxRetries: number = 3;
  public retryCount: number = 0;

  private startSessionData: StartSessionRequestParams | null = null;
  private nextClientMessageNum = 0;
  private pendingList: AgentMessage[] = [];
  private msg_processing = false;

  constructor() {
    super();
  }

  /**
   * Initialize the client
   * @param {NPClientConfig} options - Configuration options
   */

  init(options: NPClientConfig) {
    if (this.initialized) {
      logger.Log(LOG_LEVEL.LOG_Warning, "[NPClient] Already initialized.");
      return;
    }

    // Validate options
    if (!options.NPServerURL) {
      throw new Error("NPClient.init() requires a NPServerURL option");
    }

    // Set configuration
    this.NPServerURL = options.NPServerURL;
    this.sysInfo = options.sysInfo || "";
    this.autoReconnect = options.autoReconnect !== false;
    this.maxRetries = options.maxRetries || 3;
    this.receiveTimeout = options.receiveTimeout || 45;
    this.sendTimeout = options.sendTimeout || 15000;

    this.NPJWIComm = NPJWIComm_HTTP;

    // Configure NPJWIComm
    this.NPJWIComm.url = this.NPServerURL;
    this.NPJWIComm.sysInfo = this.sysInfo;

    // Set up message processor callback
    this.NPJWIComm.Init((response) => {
      this.OnNewMessage(response);
    });

    this.initialized = true;
    logger.Log(LOG_LEVEL.LOG_Debug, "[NPClient] Initialized with URL:" + this.NPServerURL);
  }

  GetInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get current settings
   * @returns Current settings object
   */
  public GetSettings(): UserSettings {
    return SettingsManager.getSettings();
  }

  // Change settings and restart session if needed
  public ChangeSettings(settings: { userName?: string; languageCode?: string }) {
    logger.Log(LOG_LEVEL.LOG_Debug, "[NPClient] saveSettings called: " + JSON.stringify(settings));
    const hasChanges = SettingsManager.saveSettings(settings);
    if (!hasChanges) {
      logger.Log(LOG_LEVEL.LOG_Debug, "[NPClient] No settings changes - skipping session restart");
      return;
    }
    logger.Log(LOG_LEVEL.LOG_Debug, "[NPClient] Settings changed - updating config and restarting session");

    if (settings.languageCode) {
      m_config.languageCode = settings.languageCode;
    }
    if (settings.userName) {
      m_config.userName = settings.userName;
    }
    if (this.m_connected && this.m_sessionID) {
      this.startSession();
    } else {
      console.log("[NPClient] Not connected or no session ID - skipping session restart");
    }
  }

  public CreateStartSessionParams(startSession:StartSessionRequestParams): StartSessionRequestParams { 
    startSession["requestType"] = "StartSession";
		startSession["appID"] = m_config.appID;
		startSession["accessCode"] = m_config.accessCode;
		startSession["userID"] = m_config.userID;
		startSession["requesterType"] = "Client";
		startSession["sessionTimeout"] = 60000;
    startSession["userLanguage"] = m_config.languageCode;

    const clientInfo = {} as StartSessionClientInfo;
    clientInfo["clientID"] = m_config.clientID;
		clientInfo["clientType"] = m_config.clientType;
		clientInfo["clientDesign"] = m_config.clientDesign;
		clientInfo["clientVersion"] = m_config.clientVersion;
    clientInfo["timeZoneAdjust"] = new Date().getTimezoneOffset();

    const clientCapabilities: ClientCapability[] = [];
    clientCapabilities.push("TTS");
    clientInfo["clientCapabilities"] = clientCapabilities;

    const initialStates = {}
    initialStates["_User.Profile.GivenName"] = m_config.userName;
    initialStates["_User.Location.TimezoneAdjust"] = new Date().getTimezoneOffset();
    initialStates["_DebugClient"]= "CD"
    
    startSession["clientInfo"] = clientInfo;
    startSession["initialStates"] = initialStates;
    return startSession;
  }

  // Start a new session (Handle Logon)
  startSession(): void {
    logger.Log(LOG_LEVEL.LOG_Debug, "Connecting to Your Assistant...")
    if (!this.initialized) {
      throw new Error("NPClient not initialized. Call NPClient.init() first.");
    }

    if (this.m_connected) {
      logger.Log(LOG_LEVEL.LOG_Warning, "[NPClient] Session already active. Ending existing session first.");
      this.endSession();
    }

    this.emit("SetSessionConnectionLoading", true);

    this.connecting = true;

    let startSession = {} as StartSessionRequestParams;
    startSession = this.CreateStartSessionParams(startSession);

    this.startSessionData = this.NPJWIComm.StartSession(startSession);

    // Log request
    logger.Log(LOG_LEVEL.LOG_Debug, "------Start Session------")
    logger.Log(LOG_LEVEL.LOG_Debug, "StartSession request: " + JSON.stringify(startSession));
  }

  public handleBrowserOffline(): void {
    logger.Log(LOG_LEVEL.LOG_Warning, "[NPClient] Browser went offline");
    this.emit("wifi:off", {
      timestamp: new Date()
    });
  }


  public handleBrowserOnline(): void {
    logger.Log(LOG_LEVEL.LOG_Debug, "[NPClient] Browser came online");
    
    // Check if we had a session
    if (this.m_sessionID && this.NPJWIComm) {
      logger.Log(LOG_LEVEL.LOG_Debug, "[NPClient] Checking session validity after reconnection...");
      this.NPJWIComm.IsSessionActive();
    } else {
      // No session to check, just emit restored event
      this.emit("wifi:on", {
        sessionValid: false,
        timestamp: new Date()
      });
    }
  }

  // End the current session
  public endSession(): void {
    if (!this.initialized) {
      throw new Error("NPClient not initialized. Call NPClient.init() first.");
    }

    if (!this.m_connected) {
      logger.Log(LOG_LEVEL.LOG_Warning, "[NPClient] No active session to end.");
      return;
    }
    this.NPJWIComm.EndSession();
  }

  // Send text input (fire-and-forget)
  public sendText(
    text: string,
    options: { clientMessageID?: string } = {}
  ) {
    const request: PushClientMessageRequest = {
      requestType: "PushClientMessage",
      sessionID: this.m_sessionID!,
      clientMessageID: options.clientMessageID || this.NextClientMessageID(),
      userInput: {
        type: "Text",
        text: text.trim(),
      },
    };

    return this.sendMessage(request);
  }

  // Send GPS input (fire-and-forget)
  public sendGPS(gps: string) {
    this.sendStateChanges({
      "Client.GPS": gps,
      "Client.GPS.State": "Active",
    });
  }

  // Send GUI interaction (fire-and-forget)
  public SendGUI(buttonID: string, param: string) {
    const request: PushClientMessageRequest = {
      requestType: "PushClientMessage",
      sessionID: this.m_sessionID!,
      clientMessageID: this.NextClientMessageID(),
      userInput: {
        type: "GUI",
        buttonID: buttonID,
        param: "",
      },
    };
    
    if (param != null && param.length > 0) {
      request["userInput"]["param"] = param;
    }

    this.sendMessage(request);
  }


  // Select a hint
  public selectHint(returnValue: string) {
    const request: PushClientMessageRequest = {
      requestType: "PushClientMessage",
      sessionID: this.m_sessionID!,
      clientMessageID: this.NextClientMessageID(),
      userInput: {
        type: "HintSelect",
        returnValue,
      },
    };

    return this.sendMessage(request);
  }

  // Select an info item
  public selectItem(uid: string, requireDetailsData = true) {
    const request: PushClientMessageRequest = {
      requestType: "PushClientMessage",
      sessionID: this.m_sessionID!,
      clientMessageID: this.NextClientMessageID(),
      userInput: {
        type: "InfoItemSelect",
        uid,
        requireDetailsData,
      },
    };

    return this.sendMessage(request);
  }

  // Send state changes
  public sendStateChanges(states: Record<string, any>) {
    const request: PushClientMessageRequest = {
      requestType: "PushClientMessage",
      sessionID: this.m_sessionID!,
      clientMessageID: this.NextClientMessageID(),
      stateChanges: states,
    };

    return this.sendMessage(request);
  }

  // Send a custom message
  public sendUserMessage(message: Partial<PushClientMessageRequest>) {
    // Ensure sessionID is set
    if (!message.sessionID) {
      message.sessionID = this.m_sessionID!;
    }

    // Ensure clientMessageID is set
    if (!message.clientMessageID) {
      message.clientMessageID = this.NextClientMessageID();
    }

    // Ensure requestType is set
    if (!message.requestType) {
      message.requestType = "PushClientMessage";
    }

    return this.sendMessage(message as PushClientMessageRequest);
  }

  // Get current session ID
  getSessionID(): string | null {
    return this.m_sessionID;
  }

  // Check if connected
  isConnected(): boolean {
    return this.m_connected;
  }


  // ============================================
  // Private Methods
  // ============================================

  // Handle responses from NPJWIComm
  private OnNewMessage(response: NPResponse) {
    if (!response || !response.responseType) {
      logger.Log(LOG_LEVEL.LOG_Warning, "[NPClient] Invalid response: " + JSON.stringify(response));
      return;
    }

    const responseType = response.responseType;

    switch (responseType) {
      case "SessionStarted":
        this.handleSessionStarted(response as SessionStartedResponse);
        break;

      case "SessionEnded":
        this.handleSessionEnded(response as SessionEndedResponse);
        break;

      case "AgentMessage":        
        this.EnqueueMessage(response as AgentMessage);
        break;

      case "Error":
        this.handleError(response as ApiError);
        break;

      case "TimeoutNoMessage":
        // Ignore - this is expected for long-polling
        break;

      case "ReceivedClientMessage":
        break;

      case "SessionStatus":
        this.handleSessionStatus(response as IsSessionActiveResponse);
        break;

      default:
        logger.Log(LOG_LEVEL.LOG_Debug, "[NPClient] Unhandled response type: " + responseType);
        // Emit as generic message
        this.emit("message", response);
    }
  }

  // Handle SessionStatus response (from IsSessionActive check)
  private handleSessionStatus(response: IsSessionActiveResponse): void {
    this.m_sessionID = response.sessionID;
    const isValid = response.status === "Active";
    
    logger.Log(LOG_LEVEL.LOG_Debug, "[NPClient] Session status checked: " + response.status);
    
    // Emit connection restored event with session validity
    this.emit("wifi:on", {
      sessionValid: isValid,
      timestamp: new Date()
    });
    
    // If session is valid, restart receive channel
    if (isValid) {
      logger.Log(LOG_LEVEL.LOG_Debug, "[NPClient] Session valid - restarting receive channel");
      // Restart receive polling to get new messages
      if (this.NPJWIComm && !this.NPJWIComm.receiveActive) {
        this.NPJWIComm.StartReceive();
      }
    } else {
      // Session invalid - emit error event with category
      this.m_connected = false;
      this.emit("error", {
        responseType: 'Error',
        requestType: 'IsSessionActive' as any,
        errorCode: "ERR_SESSION_TIMEOUT",
        errorMessage: "Session expired during reconnection",
        serverTime: response?.serverTime,
        executionTime: response?.executionTime,
        category: ErrorCategory.SESSION_EXPIRED,
        timestamp: new Date()
      });
    }
  }

  // Handle SessionStarted response
  private handleSessionStarted(response: SessionStartedResponse) {
    this.m_connected = true;
    this.connecting = false;
    this.m_sessionID = response.sessionID;
    this.remoteMessageQueuing = response.remoteMessageQueuing;
    // If a greeting is guaranteed to be sent, emit loading event.
    this.emit("SetAgentMessageLoading", true);

    logger.Log(LOG_LEVEL.LOG_Warning, "m_connected set to " + this.m_connected);
    this.NPJWIComm.sessionID = this.m_sessionID;

    logger.Log(LOG_LEVEL.LOG_Debug, "[NPClient] Session started: " + this.m_sessionID);
    // Start receive loop if not already active
    if (!this.NPJWIComm.receiveActive) {
      this.NPJWIComm.receiveActive = true;
      this.NPJWIComm.StartReceive();
    }

    // console.log("[NPClient] Session started:", this.m_sessionID);
    this.emit("SetSessionConnectionLoading", false);

    // Emit events
    this.emit("session:started", {
      ...response,
      sessionID: this.m_sessionID,
      remoteMessageQueuing: response.remoteMessageQueuing,
    });
  }

  // Handle SessionEnded response
  private handleSessionEnded(response: SessionEndedResponse) {
    const wasConnected = this.m_connected;

    this.m_connected = false;
    this.connecting = false;
    this.m_sessionID = null;
    this.lastAgentMessageID = null;

    if (wasConnected) {
      logger.Log(LOG_LEVEL.LOG_Debug, "[NPClient] Session ended response Received.");
      this.emit("session:ended", response);
    }
  }



  // Queue a message for sequential processing
  private EnqueueMessage(message: AgentMessage) {
    if (message.agentMessageID) {
      this.lastAgentMessageID = message.agentMessageID;
    }
    this.pendingList.push(message);
    if (!this.msg_processing) {
      this.HandleQueue();
    }
  }

  // Process queued messages sequentially
  private HandleQueue() {
    if (this.msg_processing || this.pendingList.length === 0) {
      return;
    }

    this.msg_processing = true;

    while (this.pendingList.length > 0) {
      const message = this.pendingList.shift()!;
      this.processAgentMessage(message);
    }

    this.msg_processing = false;
  }

  // Process a single agent message
  private processAgentMessage(message: AgentMessage) {
    if (message.agentMessageType === "Partial") {
      return;
    }

    if (message.agentMessageType === "Complete") {
      this.emit("SetAgentMessageLoading", false);
    }
    // Process domain
    if (message.domain) {
      this.domain = message.domain;
      this.emit("domain:changed", message.domain);
    }

    // Process agent state
    if (message.agentState) {
      this.agentState = message.agentState;
      this.emit("agent:state:changed", message.agentState);
    }

    // Process do
    if (message.do) {
      if (message.do.stateChanges) {
        this.updateClientStates(message.do.stateChanges);
      }
      if (message.do.assistantInfo && message.do.assistantInfo.manualData) {
        this.manualData = message.do.assistantInfo.manualData;
        this.emit("assistant:info:manualLoaded", this.manualData);
      }
    }

    

    // Parse the message into UI-friendly format
    const processedMsg: UIAgentMessage = NPContentParser.processAgentMessage(message);
    logger.Log(LOG_LEVEL.LOG_Debug, "[NPClient] Parsed message: " + JSON.stringify(processedMsg));

    // Emit parsed message event
    // We send the parsed structure which contains agentSay, hints, and details
    this.emit("message", processedMsg);

    // Handle final message
    if (message.agentMessageType === "Final") {
      this.endSession();
      this.emit("SetAgentMessageLoading", false);
    }
  }

  // Update client states
  private updateClientStates(states: Record<string, any>) {
    this.contextStates = {
      ...this.contextStates,
      ...states,
    };

    this.emit("state:changed", this.contextStates);
  }

  private handleError(error: ApiError | any) {
    const errorCode = error.errorCode || "";
    const requestType = error.requestType;
    const errorMessage = error.errorMessage;

    logger.Log(LOG_LEVEL.LOG_Error, "[NPClient] Error: " + errorCode + " " + requestType + " " + errorMessage);

    // Stop loading indicators
    this.emit("SetAgentMessageLoading", false);
    this.emit("SetSessionConnectionLoading", false);

    // Categorize the error
    const category = ErrorClassifier.categorize(errorCode);

    // Handle based on category - keep retry/disconnect logic here in NPClient
    if (category === ErrorCategory.SESSION_EXPIRED) {
      // Session expired - disconnect and clear session
      this.m_connected = false;
      this.m_sessionID = null;
      
    } else if (category === ErrorCategory.SERVER || category === ErrorCategory.CREDENTIALS) {
      // Server errors - check if we should retry on StartSession
      if (requestType === "StartSession" && category === ErrorCategory.SERVER && this.retryCount < this.maxRetries) {
        logger.Log(LOG_LEVEL.LOG_Debug, `[NPClient] Server error during StartSession - retrying... (${this.retryCount + 1}/${this.maxRetries})`);
        this.RetryConnect();
        return;
      } else {
        this.m_connected = false;
        if (category === ErrorCategory.CREDENTIALS) {
          this.m_sessionID = null;
        }
      }
      
    } else if (category === ErrorCategory.CLIENT) {
      // Client errors - disconnect and clear session
      this.m_connected = false;
      this.m_sessionID = null;
      
    } else if (category === ErrorCategory.NETWORK) {
      // Network errors - don't disconnect, handled by connection:lost/restored events
    }

    // Emit unified error event with category
    this.emit("error", {
      ...error,
      category,
      timestamp: new Date()
    });
  }

  // Helper: Disconnect and clean up state
  private disconnect(clearSession: boolean = false) {
    this.m_connected = false;
    
    if (clearSession) {
      this.m_sessionID = null;
    }
  }

  private RetryConnect() {
    this.m_connected = false
    if (this.retryCount < this.maxRetries) {
      this.DoRetryConnect();
    } else {
      logger.Log(LOG_LEVEL.LOG_Error, `[NPClient] There's a problem with connection to server.`);
      this.emit("error", {errorCode: "ERR_SERVER_CONNECTION", errorMessage: "There's a problem with connection to server."})
    }
  }


  private DoRetryConnect() {
    this.retryCount++;
    setTimeout(() => {
      logger.Log(LOG_LEVEL.LOG_Debug, `[NPClient] Retrying session (attempt ${this.retryCount}/${this.maxRetries})...`);
      if (this.startSessionData) {
        this.startSession()
      }
    }, 2000);
  }


  // Send a message via NPJWIComm
  private sendMessage(request: PushClientMessageRequest): void {
    if (!this.NPJWIComm) {
      throw new Error("NPJWIComm not initialized");
    }
    if (!this.m_connected) {
      throw new Error("Not connected to server");
    }
    
    this.NPJWIComm.PushClientMessage(request);
    this._PostProcessInput(false, false, true, false);
  }

  // Stop SR, TTS, StartChatSpinner, clearInfo
  private _PostProcessInput(
    SROn: boolean,
    TTSOn: boolean,
    ChatSpinnerOn: boolean,
    InfoOn: boolean
  ): void {
    this.emit("SetAgentMessageLoading", ChatSpinnerOn);
  }

  // Generate a unique client message ID
  private NextClientMessageID(): string {
    return `client_${this.nextClientMessageNum++}`;
  }
}

// Create and export singleton instance
const clientInstance = new NPClient();

// Export for ES modules
export { clientInstance as NPClient };
