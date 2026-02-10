/**
 * NPJWI Protocol Type Definitions
 * Based on API Specification v1.21
 */

// ----------------------------------------------------------------------------
// Common Types
// ----------------------------------------------------------------------------

export type ClientType = 
    | 'Smartphone' 
    | 'Tablet' 
    | 'Browser' 
    | 'PC' 
    | 'SmartSpeaker' 
    | 'Vehicle';

export type ClientCapability = 
    | 'ASR' 
    | 'TTS' 
    | 'SMS' 
    | 'Phone' 
    | 'Navi' 
    | 'Contacts' 
    | 'Music' 
    | 'Calendar' 
    | 'SDN' 
    | 'Character' 
    | 'Recommendation' 
    | 'VSS' 
    | 'Survey';


export type RequestType = 
    | 'StartSession' 
    | 'EndSession' 
    | 'PushClientMessage' 
    | 'MessageComplete';


export interface ClientInfoBase {
    clientID: string;
    clientType: ClientType | string;
    clientDesign: 'NoDesign' | string;
    clientVersion: string;
}

export interface StartSessionClientInfo extends ClientInfoBase {
    clientCapabilities: ClientCapability[];
    // View Appendix A for details
    clientOptions?: Record<string, string>;
}

export interface PushClientMessageClientInfo extends ClientInfoBase {
}

// ----------------------------------------------------------------------------
// Response: Error
// ----------------------------------------------------------------------------

export type NPServerErrorCode = 
    | 'ERR_ACCESS_ERROR'
    | 'ERR_SYSTEM_ERROR'
    | 'ERR_EXCEPTION'
    | 'ERR_INVALID_SESSIONID'

export type NPClientErrorCode = 
    | 'ERR_MISSING_AGENTMESSAGEID'
    | 'ERR_UNEXPECTED_AGENTMESSAGEID'
    | 'ERR_UNHANDLED_REQUEST'
    | 'ERR_MISSING_PARAMETER'
    | 'ERR_UNKNOWN_PARAMETER'
    | 'ERR_BAD_PARAMETER_TYPE';

export type NPErrorCode = NPServerErrorCode | NPClientErrorCode;

export interface ApiError {
    responseType: 'Error';
    sessionID?: string;
    requestType: RequestType;
    errorCode: NPErrorCode | string;
    errorMessage: string;
    serverTime: string;
    executionTime: number | string;
}

// ----------------------------------------------------------------------------
// Request: StartSession
// ----------------------------------------------------------------------------

// {
//     "requestType": "StartSession",
//     "appID": "<AppID>",
//     "accessCode": "<AccessCode>",
//     "userID": "<UserID>",
//     "userLanguage": "<UserLanguage>",
 
//     "clientInfo": {
//         "clientID": "<ClientID>",
//         "clientType": "<ClientType>",
//         "clientDesign": "<ClientDesign>",
//         "clientVersion": "<ClientVersion>",
//         "clientCapabilities": [
//             "<ClientCapability1>",
//             "<ClientCapability2>",
//             ...
//         ],
//         "clientOptions": {
//             "<ClientOption1>": "<ClientOptionValue1>",
//             "<ClientOption2>": "<ClientOptionValue2>",
//             ...
//         }
//     },
 
//     "initialStates": {
//         "<StateName1>": "<StateValue1>",
//         "<StateName2>": "<StateValue2>",
//         ...
//     },
 
//     "requesterType": "<RequesterType>",
//     "sessionTimeout": <Timeout>,
//     "timezoneUtcAdjust": <TZ_Minutes>
// }
export interface StartSessionRequestParams {
    requestType: 'StartSession';
    appID: string;
    accessCode?: string;
    userID: string;
    userLanguage?: string; // 2-char ISO 639
    clientInfo: StartSessionClientInfo;
    initialStates?: Record<string, string>;
    requesterType?: 'Client' | 'ClientServer';
    sessionTimeout?: number | string;
    timezoneUtcAdjust: number | string;
}

export interface SessionStartedResponse {
    responseType: 'SessionStarted';
    sessionID: string;
    remoteMessageQueuing?: 'Inactive' | 'SDN';
    serverTime: string;
    executionTime: number | string;
}

// ----------------------------------------------------------------------------
// Request: EndSession
// ----------------------------------------------------------------------------

export interface EndSessionRequest {
    requestType: 'EndSession';
    sessionID: string;
}

export interface SessionEndedResponse {
    responseType: 'SessionEnded';
    sessionID: string;
    serverTime: string;
    executionTime: number | string;
}

// ----------------------------------------------------------------------------
// Request: PushClientMessage
// ----------------------------------------------------------------------------

export type UserInputType = 
    | 'Text' 
    | 'HintSelect' 
    | 'InfoItemSelect' 
    | 'GUI' 
    | 'ASR' 
    | 'ASR_Cancel'
    | 'SurveyResult'
    | 'Feedback';

export interface UserInputText {
    type: 'Text';
    text: string;
}

export interface UserInputHintSelect {
    type: 'HintSelect';
    returnValue: string;
    text?: string;
}

export type ButtonID = "StartOver" | "Back" | "Exit" | "ShowMore" | "RejectAll" | "OpenDashboard" | "CloseDashboard" | "OpenSettings" | "CloseSettings" |"OpenKnowledge" | "CloseKnowledge" | "Call" | "Navi" | "Bookmark" | "ShowBookmark" | "Reject" | "OK" | "Help" | "RemoveIntent" | "Refresh" | "PlayQueuedNotifications";

export interface UserInputInfoItemSelect {
    type: 'InfoItemSelect';
    uid: string;
    requireDetailsData: boolean;
}

export interface UserInputGUI {
    type: 'GUI';
    buttonID: ButtonID;
    param?: string;
}

export interface UserInputAlternative {
    text: string;
    confidence?: number | string;
}

export interface UserInputASR {
    type: 'ASR';
    inputID?: string;
    text: string;
    confidence?: number | string;
    timestamp?: string | Date;
    alternatives?: UserInputAlternative[];
}

export interface UserInputASRCancel {
    type: 'ASR_Cancel';
    inputID?: string;
}

export interface SurveyResult {
    title: string;
    questionText: string;
    userChoices: string[];
}

export interface UserInputSurveyResult {
    type: 'SurveyResult';
    surveyID: string;
    surveyType: string;
    surveyResults: SurveyResult[];
}

export interface UserInputFeedback {
    type: 'Feedback';
    feedbackID: string;
    feedback: string;
}

export type UserInput = 
    | UserInputText 
    | UserInputHintSelect 
    | UserInputInfoItemSelect 
    | UserInputGUI 
    | UserInputASR
    | UserInputASRCancel
    | UserInputSurveyResult
    | UserInputFeedback
    | { type: string; [key: string]: any };

export interface AppEvent {
    eventID: string;
    eventParams?: Record<string, string>;
}

export interface PushClientMessageRequest {
    requestType: 'PushClientMessage';
    sessionID: string;
    clientMessageID: string;
    userInput?: UserInput;
    stateChanges?: Record<string, string>;
    syncStates?: Record<string, string>;
    appCommandResponse?: any; // Specific structure depends on command
    appQueryResults?: any;
    events?: AppEvent[];
    // clientInfo is only sent if switching client types in-session
    clientInfo?: PushClientMessageClientInfo;
}

export interface ReceivedClientMessageResponse {
    responseType: 'ReceivedClientMessage';
    sessionID: string;
    clientMessageID: string;
    serverTime: string;
    executionTime: number | string;
}

// ----------------------------------------------------------------------------
// Request: PullAgentMessage
// ----------------------------------------------------------------------------

export interface PullAgentMessageRequest {
    requestType: 'PullAgentMessage';
    sessionID: string;
    timeout: number | string;
    agentMessageID: string;
}

export interface TimeoutNoMessageResponse {
    responseType: 'TimeoutNoMessage';
    sessionID: string;
}

// ----------------------------------------------------------------------------
// Response: AgentMessage (The core response for everything)
// ----------------------------------------------------------------------------

export type DisplayInfoType = 'Dashboard' | 'ResultsNew' | 'ResultsAdditional' | 'Clear' | 'Details' | 'ResultsAdditionalRepeat';

export interface InfoEntry {
    [key: string]: any;
    graphic?: {
        url: string;
        altText?: string;
    };
}

export interface DisplayDocument {
    type: string;
    target: string;
    URI: string;
}

export interface DisplayInfo {
    type: DisplayInfoType;
    sourceID?: string;
    customerSourceID?: string[];
    format?: string;
    outputVoice?: boolean;
    data: any;
}

export interface DisplayHintsEntry {
    returnValue: string;
    visualLabel: string;
    voiceLabel?: string;
    graphic?: string;
}

export interface DisplayHintsOptions {
    type: "List" | "Buttons" | "InfoButtons";
    graphicBase?: string;
}

export interface DisplayHints {
    options: DisplayHintsOptions;
    entries: DisplayHintsEntry[];
    
}

export interface DisplayInterpretationInterpretation {
    entityName: string;
    entityLabel: string;
    entityValues: string[];
    valueLabels: string[];
    fullLabel: string;
}

export interface DisplayInterpretationResultingIntent {
    entityName: string;
    entityLabel: string;
    entityValues: string[];
    valueLabels: string[];
    fullLabel: string;
}

export interface DisplayInterpretations {
    interpretation: DisplayInterpretationInterpretation[];
    resultingIntent?: DisplayInterpretationResultingIntent[];
}

export interface Display {
    itemSelections?: string[][];
    hints?: DisplayHints;
    info?: DisplayInfo;
    document?: DisplayDocument;
    status?: string;
    interpretations: DisplayInterpretations;
    
}

export interface Say {
    type: "Statement" | "Info" | "Hints" | "Prompt"
    visual: string;
    voice?: string;
    animation?: string;
}

type AgentState = {
    agentStateID: "AgentTop" | "Dashboard" | "Notification" | "PreSearch" | "Results"|"Details"|"Survey" | "NoResults" | "EndSession"
    agentStateValue?: "Success" | "Reduce" | "BroadReduce" | "Done" | string;
}


export interface AnswerMetricItem {
    knowledgeID: string;
    itemConfidence: number | string;
    sourceID: string[];
}
export interface AnswerMetrics {
    answerConfidence: number | string;
    itemMatches: AnswerMetricItem[];
}

export interface SDNState {
    clientState: "Enabled" | "Disabled" | "Delayed" | "Pending";
    CCW: number | string;
    TCW: number | string;
}

export interface SurveyChoice {
    value: string;
    label: string;
}

export interface SurveySlider {
    defValue: number | string;
    defLabel: string;
    minValue: number | string;
    minLabel: string;
    maxValue: number | string;
    maxLabel: string;
    step: number | string;
}

export interface SurveyQuestion {
    title: string;
    questionText: string;
    choiceType: string;
    userChoices?: SurveyChoice[];
    sliderOptions?: SurveySlider;
    feedbackState?: string;
}

export interface Survey {
    surveyID: string;
    surveyType: string;
    overview: string;
    questions: SurveyQuestion[];
}

export interface Situation {
    name: string;
    location: string;
    time: string;
}

export interface SituationInfo {
    startingGPS: string;
    situationList: Situation[];
}

export type DeploymentLevel = "Live" | "Staging" | "Development";

export type UserType = "User" | "QA" | "CD" | "ACD" | "KE" | "SE" | "Admin";

export type SurveyRule = "Rigid" | "NonRigid" | "NoSurvey";

export type SituationRule = "On" | "Off"

export type ManualData = {
    url: string;
    checksum: string;
}

export interface AssistantInfo {
    name: string;
    language: string;
    versionID?: string;
    deploymentLevel?: DeploymentLevel;
    nluDomain?: string;
    nluVersion?: string;
    userType?: UserType;
    surveyRule?: SurveyRule;
    situationRule?: SituationRule;
    manualData?: ManualData[];
    surveys?: Survey[];
    situations?: SituationInfo;
    events?: AppEvent[];
}

export interface DoAction {
    stateChanges?: Record<string, string>;
    appCommands?: any;
    appQueryRequest?: any;
    SDN?: SDNState;
    assistantInfo?: AssistantInfo;
}

export interface AgentError {
    source: "Parser" | "Search" | "Recommendation";
    errorCode: string;
    errorMessage: string;
}

export type AutotestResultCode = "SINGLE_RESULT_REWRITE" | "MERGE_REWRITE" | "EXTERNAL_CHAT" | "NOT_CLOSE_QLIST" | "NO_REWRITE_QLIST" | "NO_REWRITE_SINGLE_RESULT" | "NO_RESULT" | "REWRITE_FAIL_ANSWER" | "MERGE_FAIL_QLIST" | "EXTERNAL_CHAT_FAIL";

export interface Autotest {
    resultCode: AutotestResultCode;
    npcrl: string;
}

export interface AgentMessage {
    responseType: 'AgentMessage';
    sessionID: string;
    interrupt?: boolean;
    agentMessageID: string;
    agentMessageType: "Complete" | "Partial" | "Asynch"| "Final";
    clientMessageID?: string;
    domain?: "Meta" | "Restaurant" | "LocalBusiness" | "Event" | "Weather" | "Address" | "Contacts" | "Calendar"
    agentState?: AgentState;
    notificationStatus?: number;
    priority?: "Emergency" | "Critical" | "Major" | "Minor";
    answerMetrics?: AnswerMetrics;
    
    // Core Agent Output
    say: Say[];
    display?: Display;
    
    // App Control
    do?: DoAction;
    
    errors?: AgentError[];
    autotest?: Autotest;
    
    serverTime?: string | number;
    executionTime?: number;
}

// ----------------------------------------------------------------------------
// Request: MessageComplete
// ----------------------------------------------------------------------------

export interface MessageCompleteRequest {
    requestType: 'MessageComplete';
    sessionID: string;
    agentMessageID: string;
}

// ----------------------------------------------------------------------------
// Response: MessageComplete
// ----------------------------------------------------------------------------

export interface MessageCompleteResponse {
    responseType: 'ReceivedMessageComplete';
    sessionID: string;
    agentMessageID: string;
    serverTime: string;
    executionTime: number;
}

// ----------------------------------------------------------------------------
// Utility: IsSessionActive
// ----------------------------------------------------------------------------

export interface IsSessionActiveRequest {
    requestType: 'IsSessionActive';
    appID: string;
    sessionID: string;
}

export interface IsSessionActiveResponse {
    responseType: 'SessionStatus';
    sessionID: string;
    status: "Active" | "Inactive";
    serverTime: string;
    executionTime: number;
}

// ----------------------------------------------------------------------------
// Utility: GetAppData
// ----------------------------------------------------------------------------

export interface GetAppDataRequest {
    requestType: 'GetAppData';
    appID: string;
    dataID: string;
}

export interface GetAppDataResponse {
    responseType: 'AppData';
    appID: string;
    appData: string;
}

// ----------------------------------------------------------------------------
// Utility: GetAssistantData
// ----------------------------------------------------------------------------

export interface GetAssistantDataRequest {
    requestType: 'GetAssistantData';
    appID: string;
    accessCode: string;
    dataID: string;
    option?: string;
}

export interface GetAssistantDataResponse {
    responseType: 'AssistantData';
    dataID: string;
    assistantData: string;
    serverTime: string;
    executionTime: number;
}

// ----------------------------------------------------------------------------
// Utility: StoreAssistantData
// ----------------------------------------------------------------------------

export interface StoreAssistantDataRequest {
    requestType: 'StoreAssistantData';
    appID: string;
    accessCode: string;
    dataID: string;
    option?: string;
    assistantData: string;
}

export interface StoreAssistantDataResponse {
    responseType: 'AssistantDataStored';
    dataID: string;
    assistantData: string;
    serverTime: string;
    executionTime: number;
}

// ----------------------------------------------------------------------------
// Utility: GetUserData
// ----------------------------------------------------------------------------

export interface GetUserDataRequest {
    requestType: 'GetUserData';
    appID: string;
    userID: string;
    accessCode?: string;
    dataID: string;
}

export interface GetUserDataResponse {
    responseType: 'UserData';
    userID: string;
    dataID: string;
    userData: string;
    serverTime: string;
    executionTime: number;
}

// ----------------------------------------------------------------------------
// Utility: GetMultiUserData
// ----------------------------------------------------------------------------

export interface GetMultiUserDataRequest {
    requestType: 'GetMultiUserData';
    appID: string;
    userID: string;
    accessCode?: string;
    dataIDList: string[];
}

export interface GetMultiUserDataResponse {
    responseType: 'UserDataMulti';
    userID: string;
    userDataPairs: Record<string, string>;
    serverTime: string;
    executionTime: number;
}

// ----------------------------------------------------------------------------
// Utility: StoreUserData
// ----------------------------------------------------------------------------
export interface StoreUserDataRequest {
    requestType: 'StoreUserData';
    appID: string;
    userID: string;
    accessCode?: string;
    dataID: string;
    userData: string;
}

export interface StoreUserDataResponse {
    responseType: 'UserDataStored';
    userID: string;
    dataID: string;
    serverTime: string;
    executionTime: number;
}

// ----------------------------------------------------------------------------
// Utility: StoreMultiUserData
// ----------------------------------------------------------------------------

export interface StoreMultiUserDataRequest {
    requestType: 'StoreMultiUserData';
    appID: string;
    userID: string;
    accessCode?: string;
    userDataPairs: Record<string, string>;
}

export interface StoreMultiUserDataResponse {
    responseType: 'UserDataStoredMulti';
    userID: string;
    dataIDList: string[];
    serverTime: string;
    executionTime: number;
}


// ----------------------------------------------------------------------------
// Union Types for safe consumption
// ----------------------------------------------------------------------------

export type NPRequest = 
    | StartSessionRequestParams
    | EndSessionRequest
    | PushClientMessageRequest
    | PullAgentMessageRequest;

export type NPResponse = 
    | SessionStartedResponse
    | SessionEndedResponse
    | ReceivedClientMessageResponse
    | AgentMessage
    | TimeoutNoMessageResponse
    | ApiError
    | IsSessionActiveResponse;
