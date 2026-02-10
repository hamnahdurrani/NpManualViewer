/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-var-requires */

import type { MessageCompleteRequest, StartSessionRequestParams } from '../types/NPJWI';
import { logger, LOG_LEVEL } from './logger';
import { NPClient } from './NPclient';

declare global {
    var NPJWI_URL: string;
    interface Window {
        NPJWIComm: any;
    }
}

var m_send_http: XMLHttpRequest;
var m_receive_http: XMLHttpRequest;
var m_withCredentials = false;

var SEND_TIMEOUT = 15000;

export interface NPJWICommType {
    sysInfo: string;
    url: string;
    sendResponseTypes: Record<string, boolean>;
    receiveResponseTypes: Record<string, boolean>;
    sessionID: string;
    receiveTimeout: number;
    receiveActive: boolean;
    receivePending: boolean;
    sendActive: boolean;
    sendQueue: any[];
    m_startSessionData: any;
    m_sessionDisconnected: boolean;
    last_agentMessageID: string;
    PullAgentMessage: any;
    RestartReceive: () => boolean;
    consecutiveReceiveErrors: number;
    messageProcessCallback: ((resp: any) => void) | null;
    InitializeComm: () => void;
    Init: (messageProcessCallback: (resp: any) => void) => void;
    ParseJSON: (json: string) => any;
    PostSendComplete: () => void;
    ProcessSendComplete: () => void;
    ProcessSendError: () => void;
    ProcessSendTimeout: () => void;
    SendSnyc: (req: any, timeout?: number) => any;
    Send: (req: any) => void;
    IsValidSendResponse: (obj: any) => boolean;
    StartReceive: () => boolean;
    Receive: () => void;
    CheckDebugStop: () => void;
    ProcessReceiveComplete: () => void;
    IsValidReceiveResponse: (resp: any) => boolean;
    ProcessReceiveError: () => void;
    ProcessReceiveTimeout: () => void;
    StartSession: (startSession: any) => any;
    EndSession: () => any;
    PushClientMessage: (req: any) => any;
    MessageComplete: () => any;
    ReconnectToSession: (needRefresh: boolean) => void;
    IsSessionActive: () => boolean;
    GetUserPointRanking: (appID: string, userID: string, dataID: string) => any;
    GetAppData: (appID: string, dataID: string) => any;
    GetUserData: (accessCode: string, appID: string, userID: string, dataID: string) => any;
    StoreUserData: (accessCode: string, appID: string, userID: string, dataID: string, dataStr: string) => any;
    GetAssistantData: (appID: string, accessCode: string, dataID: string) => any;
    next_ClientMessageNum?: number; 
    appID?: string;
}

const NPJWIComm: NPJWICommType = {
    sysInfo: "",

    url: "http://localhost:9000",

    sendResponseTypes: {
        "SessionStarted": true, "SessionEnded": true, "ReceivedClientMessage": true, "ReceivedMessageComplete": true, "Error": true, "SessionStatus": true,
        "AppData" : true, "UserData": true, "AssistantData": true, "UserDataStored" : true
    },
    receiveResponseTypes: { "AgentMessage": true, "TimeoutNoMessage": true,  "Error": true },

    sessionID: "",
    receiveTimeout: 45,
    receiveActive: false,
    receivePending: false,

    sendActive: false,
    sendQueue: new Array(),

    m_startSessionData: null,
    m_sessionDisconnected: false,

    last_agentMessageID: "",

    PullAgentMessage: null,

    messageProcessCallback: null,
    consecutiveReceiveErrors: 0,

    InitializeComm: function () {
        logger.Log(LOG_LEVEL.LOG_System, "Initialize comm");

        try {
            if (typeof NPJWI_URL !== 'undefined') {
                this.url = NPJWI_URL;
            }
        }
        catch (e) {
        }

        logger.Log(LOG_LEVEL.LOG_System, "URL: " + this.url);

        m_send_http = new XMLHttpRequest();

        m_send_http.onreadystatechange = function () {
            if (m_send_http.readyState === 4) {
                NPJWIComm.ProcessSendComplete();
            }
        };

        m_send_http.onerror = function () {
            NPJWIComm.ProcessSendError();
        };

        m_send_http.ontimeout = function () {
            NPJWIComm.ProcessSendTimeout();
        };

        logger.Log(LOG_LEVEL.LOG_System, "Send channel initialized");

        m_receive_http = new XMLHttpRequest();

        m_receive_http.onreadystatechange = function () {
            if (m_receive_http.readyState === 4) {
                NPJWIComm.ProcessReceiveComplete();
            }
        };

        // m_receive_http.onerror = function () {
        //     NPJWIComm.ProcessReceiveError();
        // };

        // m_receive_http.ontimeout = function () {
        //     NPJWIComm.ProcessReceiveTimeout();
        // };

        logger.Log(LOG_LEVEL.LOG_System, "Receive channel initialized");
    },

    Init: function (messageProcessCallback) {
        this.messageProcessCallback = messageProcessCallback;

        this.InitializeComm();
    },

    ParseJSON: function (json) {
        try {
            var obj = JSON.parse(json);
            return obj;
        }
        catch (e) {
            logger.Log(LOG_LEVEL.LOG_Critical, "JSON parse failure: " + json);
            return null;
        }
    },

    // Send channel

    PostSendComplete: function () {
        this.sendActive = false;

        if (this.sendQueue.length > 0) {
            logger.Log(LOG_LEVEL.LOG_Trace, "Pop next Send from queue - length " + this.sendQueue.length);

            var req = this.sendQueue.shift();
            this.Send(req);
        }
    },

    ProcessSendComplete: function () {
        try {
            if (m_send_http.status == 200) {
                var json = m_send_http.responseText;

                var resp = this.ParseJSON(json);

                if (resp) {
                    if (this.IsValidSendResponse(resp)) {
                        var typ = resp["responseType"];

                        logger.Log(LOG_LEVEL.LOG_Debug, "Send - responseType: " + typ);
                        logger.Log(LOG_LEVEL.LOG_Trace, "Send - JSON: " + json);

                        if (typ == "SessionStarted") {
                            this.sessionID = resp["sessionID"];
                            this.m_sessionDisconnected = false;
                            try {
                                if (typeof NPClient !== 'undefined') {
                                    NPClient.m_connected = true;
                                }
                            }
                            catch (e) {
                            }
                            this.StartReceive();
                        }

                        if (this.messageProcessCallback) {
                            this.messageProcessCallback(resp);
                        }
                    }
                }
                else {
                    logger.Log(LOG_LEVEL.LOG_Error, "Send response - invalid JSON: " + json);
                }
            }
            else {
                // var resp: any = {};
                // resp["responseType"] = "Error";
                // resp["requestType"] = "StartSession";
                // resp["errorCode"] = "ERR_ACCESS_ERROR";
                // this.messageProcessCallback(resp);
                // logger.Log(LOG_LEVEL.LOG_Error, "Send response - HTTP status: " + m_send_http.status);
                if (m_send_http.status == 502) {
                    this.messageProcessCallback({responseType:"Error", errorCode:"ERR_PROXY_ERROR"});
                } else if (m_send_http.status == 504) {
                    this.messageProcessCallback({responseType:"Error", errorCode:"ERR_PROXY_TIMEOUT"});
                } else if (m_send_http.status > 0) {
                    this.messageProcessCallback({responseType:"Error", errorCode:"ERR_SYSTEM_ERROR"});
                }
            }
        }
        catch (e) {
            logger.Log(LOG_LEVEL.LOG_Error, "Exception in ProcessSendComplete: " + e);
        }

        this.PostSendComplete();
    },

    ProcessSendError: function () {
        logger.Log(LOG_LEVEL.LOG_Error, "Send response - Error on request");
        if (this.messageProcessCallback) {
            this.messageProcessCallback({responseType:"Error", errorCode:"ERR_SEND_REQUEST"});
        }
        if (this.sendActive) {
            this.PostSendComplete();
        }
    },

    ProcessSendTimeout: function () {
        logger.Log(LOG_LEVEL.LOG_Error, "Send response - Timeout on request");
        if (this.sendActive) {
            this.PostSendComplete();
        }
    },

    SendSnyc: function (req, timeout) {

        if (this.sysInfo.length > 0) {
            req["sysInfo"] = this.sysInfo;
        }

        var json = JSON.stringify(req);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", this.url, false);
        xmlhttp.withCredentials = m_withCredentials;
        //xmlhttp.timeout = timeout == null ? SEND_TIMEOUT : timeout;
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(json);

        logger.Log(LOG_LEVEL.LOG_Debug, "Sending Snyc: " + req["requestType"] + " - " + this.url);
        logger.Log(LOG_LEVEL.LOG_Trace, "Sending: " + json);

        var jsonResp = xmlhttp.responseText;

        var resp = this.ParseJSON(jsonResp);

        return resp;
    },

    Send: function (req) {
        if (this.sysInfo.length > 0) {
            req["sysInfo"] = this.sysInfo;
        }

        var json = JSON.stringify(req);

        if (this.sendActive) {
            this.sendQueue.push(req);
            logger.Log(LOG_LEVEL.LOG_Debug, "Send active - queued request - queue length: " + this.sendQueue.length);
            logger.Log(LOG_LEVEL.LOG_Trace, "Queued: " + json);
            return;
        }

        this.sendActive = true;

        m_send_http.open("POST", this.url, true);
        m_send_http.timeout = SEND_TIMEOUT;
        m_send_http.setRequestHeader("Content-Type", "application/json");
        m_send_http.send(json);

        logger.Log(LOG_LEVEL.LOG_Debug, "Sending: " + req["requestType"] + " - " + this.url);
        logger.Log(LOG_LEVEL.LOG_Trace, "Sending: " + json);
    },

    IsValidSendResponse: function (obj) {
        var typ = obj["responseType"];

        if (typ == null) {
            logger.Log(LOG_LEVEL.LOG_Error, "Send response - Missing responseType");
            return false;
        }

        if (this.sendResponseTypes[typ] == null) {
            logger.Log(LOG_LEVEL.LOG_Error, "Send response - Unexpected responseType: " + typ);
            return false;
        }

        return true;
    },

    // Start the receive channel
    //
    StartReceive: function () {
        this.consecutiveReceiveErrors = 0;
        this.next_ClientMessageNum = 0;
        this.receiveActive = true;

        this.PullAgentMessage = { "requestType": "PullAgentMessage", "sessionID": this.sessionID, "timeout": this.receiveTimeout, "agentMessageID": "" };

        this.Receive();
        return true;
    },

    // Restart the receive channel, if it is not running
    //
    RestartReceive: function() {
	this.consecutiveReceiveErrors = 0;
	if (!this.receiveActive) {
	    this.receiveActive = true;
	    this.Receive();
        return true;
	}
        return false;
    },

    // Receive channel

    Receive: function () {
        if (!this.receivePending) {
        this.PullAgentMessage["agentMessageID"] = this.last_agentMessageID;

        if (this.sysInfo) {
            this.PullAgentMessage["sysInfo"] = "true";
        }

        var json = JSON.stringify(this.PullAgentMessage);

        logger.Log(LOG_LEVEL.LOG_Trace, "PullAgentMessage: " + json);

        m_receive_http.open("POST", this.url, true);
        m_receive_http.timeout = this.receiveTimeout*1000 + 5000;
        m_receive_http.setRequestHeader("Content-Type", "application/json");
        m_receive_http.send(json);
        this.receivePending = true;
    } else {
        logger.Log(LOG_LEVEL.LOG_Error, "Call to Receive() with Receive pending");
    }
    },

    CheckDebugStop: function() {
	this.consecutiveReceiveErrors++;

	if (this.m_sessionDisconnected) {
	        this.receiveActive = false;
        	logger.Log(LOG_LEVEL.LOG_System, "Stopped Receive due to end of session");
		return;
	}

	if (this.consecutiveReceiveErrors > 5) {
		this.receiveActive = false;
        	logger.Log(LOG_LEVEL.LOG_System, "Stopped Receive due to comm errors");
		return;
	}
    },

    ProcessReceiveComplete: function () {
        this.receivePending = false;
        if (m_receive_http.status == 200) {
            var json = m_receive_http.responseText;

            var resp = this.ParseJSON(json);

            if (resp) {
                if (this.IsValidReceiveResponse(resp)) {
                    this.consecutiveReceiveErrors = 0;
                    var typ = resp["responseType"]

                    logger.Log(LOG_LEVEL.LOG_Debug, "Receive response - responseType: " + typ);
                    logger.Log(LOG_LEVEL.LOG_Trace, "Receive response - JSON: " + json);

                    switch (typ) {
                        case "TimeoutNoMessage":
                            // We ignore this and start another receive
                            break;

                        case "AgentMessage":
                            this.last_agentMessageID = resp["agentMessageID"];
                            if (resp["agentMessageType"] == "Final") {
                                logger.Log(LOG_LEVEL.LOG_Info, "Receive response - Session ends due to agentMessageType=Final");
                                this.receiveActive = false;
                            }
                            try {
                                this.messageProcessCallback(resp);
                            }
                            catch(e) {
                                logger.Log(LOG_LEVEL.LOG_Error, "Exception in AgentMessage.messageProcessCallback: " + e);
                            }
                            break;

                        case "Error":
                            var errorCode = resp.errorCode;
                            logger.Log(LOG_LEVEL.LOG_Trace, "responseType: " + typ + " - errorCode: " + errorCode);
                            if (errorCode == "ERR_INVALID_SESSIONID" || errorCode == "ERR_SESSION_TIMEOUT") {
                                this.m_sessionDisconnected = true;
                                this.sessionID = "";
                            }
                            this.CheckDebugStop();
                            try {
                                this.messageProcessCallback(resp);
                            }
                            catch(e) {
                                logger.Log(LOG_LEVEL.LOG_Error, "Exception in Error.messageProcessCallback: " + e);
                            }
                            break;
                        default:
                            logger.Log(LOG_LEVEL.LOG_Error, "Unhandled Receive message type: " + typ);
                            break;
                    }
                }
                else {
                    logger.Log(LOG_LEVEL.LOG_Error, "Receive response - invalid JSON: " + json);
                    this.CheckDebugStop();
                }
            }
        }
        else {
            logger.Log(LOG_LEVEL.LOG_Error, "Receive response - HTTP status: " + m_receive_http.status);
            this.CheckDebugStop();
        }

        if (this.receiveActive) {
            this.Receive();
        }
    },

    IsValidReceiveResponse: function (resp) {
        var typ = resp["responseType"];

        if (typ == null) {
            logger.Log(LOG_LEVEL.LOG_Error, "Receive response - Missing responseType");
            return false;
        }

        if (this.receiveResponseTypes[typ] == null) {
            logger.Log(LOG_LEVEL.LOG_Error, "Receive response - Unexpected responseType: " + typ);
            return false;
        }

        return true;
    },

    ProcessReceiveError: function () {
        logger.Log(LOG_LEVEL.LOG_Error, "Receive response - Error on request - " + m_receive_http.status);

        this.CheckDebugStop();
        if (this.receiveActive) {
            this.Receive();
        }
    },

    ProcessReceiveTimeout: function () {
        logger.Log(LOG_LEVEL.LOG_Error, "Receive response - Timeout on request");

        this.CheckDebugStop();
        if (this.receiveActive) {
            this.Receive();
        }
    },

    // Session API Send Channel Calls
    //
    StartSession: function (startSession: StartSessionRequestParams) {
        this.Send(startSession);
        this.m_startSessionData = startSession;
        return startSession;
    },

    EndSession: function () {
        this.receiveActive = false;
        m_receive_http.abort();

        var req = { "requestType": "EndSession", "sessionID": this.sessionID };

        this.Send(req);

        return req;
    },

    PushClientMessage: function (req) {
        req["sessionID"] = this.sessionID;

        if (!this.m_sessionDisconnected) {

            this.Send(req);
        }
        else {
            this.StartSession(this.m_startSessionData);
        }

        return req;
    },

    MessageComplete: function () {
        const req: MessageCompleteRequest = { "requestType": "MessageComplete", "sessionID": this.sessionID, "agentMessageID": this.last_agentMessageID };
        this.Send(req);
        return req;
    },
    ReconnectToSession: function (needRefresh) {
        logger.Log(LOG_LEVEL.LOG_Trace, "ReconnectToSession called - " + needRefresh);
        logger.Log(LOG_LEVEL.LOG_Trace, "Current connection status - " + NPClient.m_connected);
        logger.Log(LOG_LEVEL.LOG_Trace, "Current Session ID - " + NPClient.m_sessionID);
        if (NPClient.m_sessionID.length > 0) {
            if (this.IsSessionActive(NPClient.m_sessionID)) {
                NPClient.m_connected = true;

                logger.Log(LOG_LEVEL.LOG_Trace, "Reconnect to existing session after conn restored");
                // NPC_APPUI_Wrapper.SetSpinnerState("false");
                // if (needRefresh) {
                //     NPC_CORE.SendCommandButton("Global.Refresh", "");
                // }
            }
            else {
                logger.Log(LOG_LEVEL.LOG_Trace, "Reconnect to new session after conn restored");
                this.StartSession(60000, false);
            }
        }
    },

    // Utility API Calls
    //
    IsSessionActive: function () {
        if (this.sessionID.length == 0) {
            return false;
        }
        else {
            var req = { "requestType": "IsSessionActive", "appID": this.appID || "", "sessionID": this.sessionID };

            this.Send(req);

            return true;
        }
    },

    GetUserPointRanking: function (appID:string, userID:string, dataID:string) {
        var req = {
            "requestType": "GetAppData",
            "appID": appID,
            "dataID": dataID,
            "userID": userID
        };

        var resp = this.SendSnyc(req);

        return resp;
    },

    GetAppData: function (appID:string, dataID:string) {
        var req = {
            "requestType": "GetAppData",
            "appID": appID,
            "dataID": dataID
        };

        this.Send(req);

        return req;
    },

    GetUserData: function (accessCode:string, appID:string, userID:string, dataID:string) {
        var req = {
            "requestType": "GetUserData",
            "accessCode": accessCode,
            "appID": appID,
            "userID": userID,
            "dataID": dataID
        };

        this.Send(req);

        return req;
    },

    StoreUserData: function (accessCode:string, appID:string, userID:string, dataID:string, dataStr:string) {
        var req = {
            "requestType": "StoreUserData",
            "accessCode": accessCode,
            "appID": appID,
            "userID": userID,
            "dataID": dataID,
            "userData": dataStr
        };

        this.Send(req);

        return req;
    },

    GetAssistantData: function (appID:string, accessCode:string, dataID:string) {
        var req = {
            "requestType": "GetAssistantData",
            "appID": appID,
            "accessCode": accessCode,
            "dataID": dataID
        };

        this.Send(req);

        return req;
    }
};

// Make it globally available (for browser/React)
if (typeof window !== 'undefined') {
    window.NPJWIComm = NPJWIComm;
}

// Export for ES modules
export default NPJWIComm;
