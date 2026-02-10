import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { NPClient } from '../api/core/NPclient';
import type { ManualData, SessionStartedResponse } from '../api/types/NPJWI';
import { NPClientConfig } from '@/api/core/NPClientConfig';
import { toast } from 'sonner';
import { SettingsManager } from '@/api/core/SettingsManager';
import { AuthManager } from '@/api/core/AuthManager';
import CredentialsErrorModal from '@/components/credentialsErrorModal';
import { ErrorCategory } from '@/api/core/ErrorClassifier';
import { logger, LOG_LEVEL } from '@/api/core/logger';
import { getNPJWIUrl } from '@/api/constants/NPServerMapping';

interface NPClientContextType {
  client: typeof NPClient;
  connected: boolean;
  sessionID: string;
  connecting: boolean;
  messages: any[];
  error: any;
  agentMessageLoading: boolean;
  sessionConnectionLoading: boolean;
  isSessionExpired: boolean;
  isOnline: boolean;
  serverError: string | null;
  conversationStarted: boolean;
  manualData: any[];
  setConversationStarted: React.Dispatch<React.SetStateAction<boolean>>;
  handleSendText: (text: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  addToChatHistory: (message: any) => void;
  NPClientHandleSelectHint: (returnValue: string) => void;
  NPClientHandleSelectItem: (uid: string) => void;
  startSession: () => Promise<void>;
  triggerSessionTimeout: () => void;
  clearServerError: () => void;
  handleThumbsUp: () => void;
  handleThumbsDown: () => void;
  saveSettings: (settings: any) => void;
}

const NPClientContext = createContext<NPClientContextType | undefined>(undefined);

interface NPClientProviderProps {
  children: ReactNode;
}

export function NPClientProvider({ children }: NPClientProviderProps) {
  const [connected, setConnected] = useState(false);
  const [sessionID, setSessionID] = useState("");
  const [conversationStarted, setConversationStarted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [agentMessageLoading, setAgentMessageLoading] = useState(false);
  const [sessionConnectionLoading, setSessionConnectionLoading] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [credentialsError, setCredentialsError] = useState<"missing" | "failed" | null>(null);
  const [manualData, setManualData] = useState<any[]>([]);
  // Get user preferences from SettingsManager
  const userSettings = SettingsManager.getSettings();
  const userName = userSettings.userName;
  const languageCode = userSettings.languageCode;



  useEffect(() => {
      // Get authentication credentials from AuthManager
    const credentials = AuthManager.getCredentials();
    // Log configuration source
    logger.Log(LOG_LEVEL.LOG_Debug, "[NPClientProvider] Authentication credentials: " + JSON.stringify({
      accessCode: credentials.accessCode,
      userID: credentials.userID,
    }));
 


    // Define handlers
    const onSessionStarted = (session: SessionStartedResponse) => {
      // Insert a separator message instead
      setMessages((prev) => {
        if (prev.length > 0) {
          return [
            ...prev,
            {
              id: `separator-${Date.now()}`,
              role: "separator",
              content: "End of Conversation",
              timestamp: new Date(),
            }
          ];
        }
        return prev;
      });


      setConnected(true);
      setSessionID(session.sessionID);
      setConnecting(false);
      setError(null);
      setCredentialsError(null);
      
      // Save successful credentials to localStorage
      if (credentials.accessCode && credentials.userID) {
        AuthManager.saveCredentials({
          accessCode: credentials.accessCode,
          userID: credentials.userID,
        });
      }
    };
    
    const onSessionEnded = () => {
      setConnected(false);
      setSessionID(null);
      setConnecting(false);
    };
    
    const onMessage = (msg: any) => {
      addToChatHistory(msg);
    };

    const onError = (err: any) => {
      // Handle error based on category
      const { category, errorCode, errorMessage } = err;
      
      logger.Log(LOG_LEVEL.LOG_Error, "[NPClientProvider] Error: " + category + " " + errorCode + " " + errorMessage);
      
      setError(err);
      setConnected(NPClient.m_connected);
      setConnecting(NPClient.connecting);
      
      // Handle different error categories
      switch (category) {
        case ErrorCategory.SESSION_EXPIRED:
          logger.Log(LOG_LEVEL.LOG_Warning, "[NPClientProvider] Session expired");
          setIsSessionExpired(true);
          setConnected(false);
          setSessionID("");
          break;
          
        case ErrorCategory.NETWORK:
          logger.Log(LOG_LEVEL.LOG_Warning, "[NPClientProvider] Network error");
          // Network errors are handled by connection:lost/restored events
          break;
          
        case ErrorCategory.CREDENTIALS:
        case ErrorCategory.SERVER:
        case ErrorCategory.CLIENT:
          logger.Log(LOG_LEVEL.LOG_Error, "[NPClientProvider] Server/Client error");
          setServerError(errorCode || "An Error Occurred.");
          break;
      }
    };
    
    const onAgentMessageLoading = (shown: boolean) => {
      setAgentMessageLoading(shown);
    };

    const onSessionConnectionLoading = (shown: boolean) => {
      setSessionConnectionLoading(shown);
    };

    const onNetworkOff = () => {
      logger.Log(LOG_LEVEL.LOG_Warning, "[NPClientProvider] Network Connection lost - browser offline");
      setIsOnline(false);
    };

    const onNetworkOn = (data: { sessionValid: boolean }) => {
      logger.Log(LOG_LEVEL.LOG_Debug, "[NPClientProvider] NetworkConnection restored - session valid: " + data.sessionValid);
      setIsOnline(true);
      
      if (!data.sessionValid && sessionID) {
        setIsSessionExpired(true);
        setConnected(false);
        setSessionID("");
      }
    };

    const onManualDataLoaded = (manualData: ManualData[]) => {
      logger.Log(LOG_LEVEL.LOG_Debug, "[NPClientProvider] Manual Data Loaded: " + JSON.stringify(manualData));
      setManualData(manualData);
    };

    
    // Subscribe to events
    NPClient.on("session:started", onSessionStarted);
    NPClient.on("session:ended", onSessionEnded);
    NPClient.on("message", onMessage);
    NPClient.on("error", onError);
    NPClient.on("SetAgentMessageLoading", onAgentMessageLoading);
    NPClient.on("wifi:off", onNetworkOff);
    NPClient.on("wifi:on", onNetworkOn);
    NPClient.on("SetSessionConnectionLoading", onSessionConnectionLoading);
    NPClient.on("assistant:info:manualLoaded", onManualDataLoaded);

    // Initialize NPClient but don't auto-start session
    if (!NPClient.GetInitialized()) {
      if (!credentials.accessCode || !credentials.userID) {
        logger.Log(LOG_LEVEL.LOG_Error, "[NPClientProvider] Invalid credentials");
        setCredentialsError("missing");
        return;
      }
      

      NPClient.init({
        NPServerURL: getNPJWIUrl(),
      });


      // Update initial client config with the default and provided credentials. 
      NPClientConfig.update({
        appID: "ZZEddaXofT92",
        userID: credentials.userID,
        accessCode: credentials.accessCode,
        clientID: "MiaBrowserClient",
        clientType: "WebBrowser",
        clientDesign: "NoDesign",
        clientVersion: "1.0.0",
        clientTimeZoneAdjust: new Date().getTimezoneOffset(),
        languageCode: languageCode,
        userName: userName,
      });

      logger.Log(LOG_LEVEL.LOG_Info, "[NPClientProvider] NPClient initialized, waiting for user to start session");
    }
    
    // Cleanup: Remove the listeners when component unmounts
    return () => {
      logger.Log(LOG_LEVEL.LOG_Debug, "[NPClientProvider] Unmounting");
      NPClient.clear()
    };
  }, []);

  // Handle browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      NPClient.handleBrowserOnline();
    };

    const handleOffline = () => {
      NPClient.handleBrowserOffline();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper function - addToChatHistory
  const addToChatHistory = (message: any) => {
    // Handle InfoItems (QList)
    if (message.infoItemsMeta) {
      setMessages((prev) => {
        if (message.infoItems[0].index > 0) {
          let lastQListIndex = -1;
          for (let i = prev.length - 1; i >= 0; i--) {
            if (prev[i].qList && prev[i].role === "agent") {
              lastQListIndex = i;
              break;
            }
          }

          if (lastQListIndex !== -1) {
            const newHistory = [...prev];
            const targetMsg = newHistory[lastQListIndex];

            const updatedQList = targetMsg.qList
              ? [...targetMsg.qList, ...(message.infoItems || [])]
              : message.infoItems || [];

            newHistory[lastQListIndex] = {
              ...targetMsg,
              qList: updatedQList,
              qlistMeta: message.infoItemsMeta,
            };
            return newHistory;
          }
        }

        const newHistory = [
          ...prev,
          {
            ...message,
            content: "<div>" + message.visual + "</div>",
            qList: message.infoItems,
            qlistMeta: message.infoItemsMeta,
          },
        ];
        return newHistory;
      });
      return;
    }
    // Handle regular messages
    setMessages((prev) => {
      const newHistory = [
        ...prev,
        {
          ...message,
          content: "<div>" + message.visual + "</div>",
        },
      ];
      return newHistory;
    });
  };

  const handleSendText = (userText: string) => {
    if (!userText.trim() || !connected) return;

    try {
      NPClient.sendText(userText);
      logger.Log(LOG_LEVEL.LOG_Debug, "[NPClientProvider] Text sent: " + userText);
    } catch (err) {
      logger.Log(LOG_LEVEL.LOG_Error, "[NPClientProvider] Error sending text: " + err);
      setError(err);
    }
  };

  const NPClientHandleSelectHint = (returnValue: string) => {
    if (!connected || !returnValue) return;

    try {
      NPClient.selectHint(returnValue);
      logger.Log(LOG_LEVEL.LOG_Debug, "[NPClientProvider] Hint selected: " + returnValue);
    } catch (err) {
      logger.Log(LOG_LEVEL.LOG_Error, "[NPClientProvider] Error selecting hint: " + err);
      setError(err);
    }
  };

  const NPClientHandleSelectItem = (uid: string) => {
    if (!connected || !uid) return;

    try {
      NPClient.selectItem(uid);
      logger.Log(LOG_LEVEL.LOG_Debug, "[NPClientProvider] Item selected: " + uid);
    } catch (err) {
      logger.Log(LOG_LEVEL.LOG_Error, "[NPClientProvider] Error selecting item: " + err);
      setError(err);
    }
  };

  const handleThumbsUp = () => {
    if (!connected) return;

    try {
      NPClient.SendGUI("SurveyOK", "")
      toast.success("Upvoted response.")
      logger.Log(LOG_LEVEL.LOG_Debug, "[NPClientProvider] Thumbs up sent");
    } catch (err) {
      logger.Log(LOG_LEVEL.LOG_Error, "[NPClientProvider] Error sending thumbs up: " + err);
      setError(err);
    }
  };

  const handleThumbsDown = () => {
    if (!connected) return;

    try {
      NPClient.SendGUI("SurveyNG", "")
      toast.success("Downvoted response.")
      logger.Log(LOG_LEVEL.LOG_Debug, "[NPClientProvider] Thumbs down sent");
    } catch (err) {
      logger.Log(LOG_LEVEL.LOG_Error, "[NPClientProvider] Error sending thumbs down: " + err);
      setError(err);
    }
  };

  const startSession = async () => {
    setError(null);
    setConnecting(true);
    setIsSessionExpired(false); 

    try {
      NPClient.startSession();
    } catch (err) {
      logger.Log(LOG_LEVEL.LOG_Error, "[NPClientProvider] Failed to start new session: " + err);
      setError(err);
      setConnecting(false);
    }
  };

  const triggerSessionTimeout = () => {
    setIsSessionExpired(true);
  };

  const clearServerError = () => {
    setServerError(null);
  };

  const saveSettings = (settings: any) => {
    NPClient.ChangeSettings(settings);
  };

  const value: NPClientContextType = {
    client: NPClient,
    connected,
    sessionID,
    connecting,
    messages,
    error,
    agentMessageLoading,
    sessionConnectionLoading,
    isSessionExpired,
    isOnline,
    serverError,
    conversationStarted,
    setConversationStarted,
    handleSendText,
    setMessages,
    addToChatHistory,
    NPClientHandleSelectHint,
    NPClientHandleSelectItem,
    startSession,
    triggerSessionTimeout,
    clearServerError,
    handleThumbsUp,
    handleThumbsDown,
    saveSettings,
    manualData
  };

  return (
    <NPClientContext.Provider value={value}>
      {children}
      
      {/* Credentials Error Modal */}
      <CredentialsErrorModal
        open={!!credentialsError}
        variant={credentialsError || "missing"}
        onClose={() => setCredentialsError(null)}
        onRetry={credentialsError === "failed" ? () => window.location.reload() : undefined}
      />
    </NPClientContext.Provider>
  );
}

// Custom hook to use the context
export function useNPClient() {
  const context = useContext(NPClientContext);
  if (context === undefined) {
    throw new Error('useNPClient must be used within NPClientProvider');
  }
  return context;
}
