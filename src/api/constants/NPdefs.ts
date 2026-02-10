/**
 * NPClient Definitions (v1.2)
 * Global constants and definitions for the NPClient system
 */

// =============================================================================
// Global Configuration
// =============================================================================

export const DEBUG_LOGGING = true; // ************* Ship this false *****************
export const REFRESH_FREQ = 5000;
export const MAX_CONSECUTIVE_SR_FAILURE = 1; // Maximum consecutive SR failures before abandoning retry

// =============================================================================
// Command Buttons
// =============================================================================

export const BYE_SAYFROM = "buttonbye";
export const BACK_SAYFROM = "buttonback";
export const RESTART_SAYFROM = "buttonrestart";

// =============================================================================
// Receive/Send Types
// =============================================================================

export const RECV_TYPE_NONE = "none";
export const RECV_TYPE_LOGON = "logon";
export const RECV_TYPE_LOGOFF = "logoff";
export const RECV_TYPE_ERROR = "error";
export const RECV_TYPE_NORMAL = "normal";
export const RECV_TYPE_REFRESH = "refresh";
export const RECV_TYPE_EXPIRED = "expired";
export const RECV_TYPE_RESTORED = "restored";
export const RECV_TYPE_SETUP = "setup";
export const RECV_TYPE_START = "start";
export const RECV_TYPE_REDIRECT = "redirect";

export const SEND_TYPE_UTT = "utt";
export const SEND_TYPE_STARTUP = "startup";
export const SEND_TYPE_LOGOFF = "logoff";
export const SEND_TYPE_BROWSERLOST = "browserlost";
export const SEND_TYPE_REFRESH = "refresh";
export const SEND_TYPE_WAIT4RESP = "wait4resp";
export const SEND_TYPE_ENDSESSION = "endsession";
export const SEND_TYPE_CLIENTIDLE = "clientidle";
export const SEND_TYPE_CLIENTBUSY = "clientbusy";
export const SEND_TYPE_EXPIRED = "expired";
export const SEND_TYPE_SETVALUES = "setvalues";
export const SEND_TYPE_MESSAGES = "messages";
export const SEND_TYPE_MESSAGES_NR = "NRmessages";

export const EOT_ATTR = "EOT";

export const REFRESH_NEWSMSG = "newMessage";
export const REFRESH_ACTIVE = "active";
export const REFRESH_DEFERRED = "deferred";
export const REFRESH_HALTED = "halted";

// =============================================================================
// Browser Commands
// =============================================================================

export const BROWSER_CMD_INITFRAMESSTART = "INITFRAMESSTART";
export const BROWSER_CMD_CHANGEFRAME = "CHANGEFRAME";
export const BROWSER_CMD_ADDFRAME = "ADDFRAME";
export const BROWSER_CMD_DELETEFRAME = "DELETEFRAME";
export const BROWSER_CMD_INITFRAMESEND = "INITFRAMESEND";

// New model
export const BROWSER_CMD_DEFINEPOPUP = "DEFINEPOPUP";
export const BROWSER_CMD_RESIZEPOPUP = "RESIZEPOPUP";
export const BROWSER_CMD_MOVEPOPUP = "MOVEPOPUP";
export const BROWSER_CMD_POPUPURL = "POPUPURL";
export const BROWSER_CMD_CLOSEPOPUP = "CLOSEPOPUP";
export const BROWSER_CMD_SETBASE = "SETBASE";
export const BROWSER_CMD_UPDATEHTML = "UPDATEHTML";
export const BROWSER_CMD_UPDATEVALUE = "UPDATEVALUE";
export const BROWSER_CMD_EXECSCRIPT = "EXECSCRIPT";
export const BROWSER_CMD_GETVALUE = "GETVALUE";
export const BROWSER_CMD_LOADVALUES = "LOADVALUES";

// Old model
export const BROWSER_CMD_SHOWPOPUP = "DISPLAY_POPUP";
export const BROWSER_CMD_SETCLOSEPOPUP = "CLOSE_POPUP";
export const BROWSER_CMD_POPUPPOS = "SET_POPUP_POS";
export const BROWSER_CMD_POPUPSIZE = "SET_POPUP_SIZE";

export const CENTER = "CENTER";

// =============================================================================
// Message Names
// =============================================================================

export const MESSAGES_NAME = "Messages";
export const MESSAGE_NAME = "Message";
export const TARGET_NAME = "Target";
export const COMMAND_NAME = "Command";
export const PARAMS_NAME = "Params";
export const PARAM_NAME = "Param";
export const ERRORID_NAME = "ErrorID";
export const ERRORMSG_NAME = "ErrorMessage";

// =============================================================================
// Handler Types
// =============================================================================

export const BROWSER_HANDLER = "BROWSER";
export const BODY_HANDLER = "BODY";
export const SPEECH_HANDLER = "SPEECH";
export const TIME_HANDLER = "TIME";
export const CS_HANDLER = "CLIENTSYSTEM";
export const CTX_HANDLER = "CONTEXT";

// =============================================================================
// Speech Commands
// =============================================================================

export const SPEECH_SAYTO_COMMAND = "SAYTO";
export const SPEECH_ALTS_COMMAND = "DISPLAYALTERNATES";
export const SPEECH_LISTS_COMMAND = "DISPLAYLISTING";
export const SPEECH_LISTS_EX_COMMAND = "DISPLAYLISTINGEX";
export const SPEECH_CLEAR_COMMAND = "CLRSAYTO";
export const SPEECH_REPEAT_TTS_COMMAND = "REPEATTTS";
export const SPEECH_NLU_COMMAND = "NLU";

// =============================================================================
// Body Animation Commands
// =============================================================================

export const BODY_PLAYANIM_OLD_COMMAND = "PLAYANIMATION";
export const BODY_PLAYANIM_COMMAND = "PLAYANIMATION2D";
export const BODY_SYNCMODE_COMMAND = "SETSYNCMODE2D";
export const BODY_RESYNC_COMMAND = "RESYNCANIM2D";
export const BODY_DISABLEIDLE_COMMAND = "DISABLEIDLE";
export const BODY_ENABLEIDLE_COMMAND = "ENABLEIDLE";

// =============================================================================
// Client System Commands
// =============================================================================

export const CS_DIE_COMMAND = "DIE";
export const CS_LOGOFF_COMMAND = "DISCONNECT";
export const CS_SHOW_CONTROL = "SHOWCONTROL";
export const CS_ENABLE_CONTROL = "ENABLECONTROL";
export const CS_DISABLE_CONTROL = "DISABLECONTROL";
export const CS_SET_CONTROL_TEXT = "SETCONTROLTEXT";
export const CS_DISPLAY_FORM = "DISPLAYFORM";
export const CS_SETDISPLAYMODE = "SETDISPLAYMODE";
export const CS_DISPLAYDATA = "DISPLAYDATA";
export const CS_REQNEXTMSG = "REQUESTNEXTMESSAGE";
export const CS_DISPLAYACTION = "DISPLAYACTION";
export const CS_APPCOMMAND = "APPCOMMAND";
export const CS_DISCONNECT = "DISCONNECT";
export const CS_HELPRESPONSE = "HELPRESPONSE";
export const CS_APPREQUEST = "APPREQUEST";
export const CS_SHOWDOCUMENT = "SHOWDOCUMENT";
export const CS_SETDOMAIN = "SETDOMAIN";
export const CS_SETCORSOR = "SETCORSOR";
export const CS_CURRENTAGENTSTATE = "CURRENTAGENTSTATE";
export const CS_SETLAYOUTMODE = "SETLAYOUTMODE";
export const CS_UPDATE_STATE = "UPDATESTATE";
export const CS_GENERAL_EVENT = "GENERALEVENT";
export const CS_INPUTRESULT = "INPUTRESULT";
export const CS_SHOWCRITERIA = "ShowCriteria";

// =============================================================================
// Time Commands
// =============================================================================

export const TIME_CMD_DELAY = "DELAY";

// =============================================================================
// Browser Detection
// =============================================================================

export const SAFARI = "Safari";
export const NETSCAPE = "NS";
export const MSIE = "MSIE";
export const GCHROME = "Chrome";
export const FIREFOX = "Firefox";
export const OPERA = "Opera";
export const MOZILLA = "Mozilla";

// =============================================================================
// Operating System Detection
// =============================================================================

export const WINDOWS_OS = "Win";
export const MAC_OS = "Mac";

// =============================================================================
// Maintenance Modes
// =============================================================================

export const MM_NORMAL = "normal";
export const MM_WARNING = "warning";
export const MM_BLOCKNEW = "blocknew";
export const MM_SHUTDOWN = "shutdown";

// =============================================================================
// Frame Names
// =============================================================================

export const NP_CLIENT_FRAME = "_NP_CLIENT_";

// =============================================================================
// Animation States
// =============================================================================

export const ANIM_SPEAKING = "ANIM_SPEAKING";
export const ANIM_SEARCHING = "ANIM_SEARCHING";
export const ANIM_NOTCONNECTED = "ANIM_NOTCONNECTED";
export const ANIM_IDLE = "ANIM_IDLE";

// =============================================================================
// Settings UIDs
// =============================================================================

export const SETTING_APP_MODE = "AppMode";
export const SETTING_SILENT_MODE = "SrSilentMode";
export const SETTING_MIC_MODE = "SrListening";
export const SETTING_SR_WAKEUP_MODE = "SrWakeup";
export const SETTING_SR_AUTOSTART = "SrAutoStart";
export const SETTING_SR_RETRY_COUNT = "SrRetryCount";
export const SETTING_TTS_MODE = "UseTts";
export const SETTING_FR_MODE = "FaceRecognition";
export const SETTING_USE_CURRENT_LOCATION = "UseCurrentLocation";
export const SETTING_USE_ADDRESS_LOCATION = "UseLocationAddress";
export const SETTING_DEFAULT_LOC_NAME = "DefaultLocationName";
export const SETTING_DEFAULT_LOC_GPS = "DefaultLocationGPS";
export const SETTING_WORK_LOC_NAME = "WorkLocationName";
export const SETTING_WORK_LOC_GPS = "WorkLocationGPS";
export const SETTING_HOME_LOC_NAME = "HomeLocationName";
export const SETTING_HOME_LOC_GPS = "HomeLocationGPS";
export const SETTING_WIZARDONSTART = "ShowWizard";
export const SETTING_PROFILE_NAME = "ProfileName";
export const SETTING_PROFILE_PRON = "ProfilePronunciation";
export const SETTING_FACEBOOK_ID = "FacebookId";
export const SETTING_TWITTER_ID = "TwitterId";
export const SETTING_EMAIL_ID = "EmailId";
export const SETTING_APP_AUTOSTART = "AppAutoStartup";
export const SETTING_SOFTWARE_UPDATE = "AppAutoUpdate";

// =============================================================================
// BaseAgent States
// =============================================================================

export const STATE_OPMODE = "System.OpMode";
export const STATE_HOME_LOCATION_GPS = "User.Location.Home";
export const STATE_WORK_LOCATION_GPS = "User.Location.Work";
export const STATE_CLIENT_TIMEZONE = "State.Client.Timezone";
export const STATE_CLIENT_GPS = "State.Client.GPS";
export const STATE_CLIENT_SRTYPE = "State.Client.SrType";
export const STATE_CLIENT_APPLIST = "State.Client.AppList";
export const STATE_CLIENT_DISPLAYMODE = "State.Client.DisplayMode";
export const STATE_CLIENT_DICTATION_APPLIST = "State.Client.DictationAppList";
export const STATE_CLIENT_ACTIVE_DICTATION_APP = "State.Client.ActiveDictationApp";
export const STATE_CLIENT_SUPPOTED_MAP_TYPE = "State.Client.SupportedMapTypes";
export const STATE_CLIENT_DATABASE_APP = "State.Client.Databases";
export const STATE_CLIENT_GPSSTATE = "State.Client.GPSState";
export const STATE_USER_NAME = "State.User.Name";
export const STATE_USER_PRONOUNCE = "State.User.NamePronounce";
export const STATE_USER_EMAIL = "State.User.Email";
export const DEVICE_ID = "devID";
export const STATE_CLIENT_SHOW_QUESTION = "State.Client.ShowQuestion";

// =============================================================================
// System Error Codes
// =============================================================================

export const SR_MIC_ERROR = "SR_MIC_ERROR";
export const SR_INIT_FAIL = "SR_INIT_FAIL";
export const SR_CONN_FAIL = "SR_CONN_FAIL";
export const SR_CONCURRENT_USER_EXCEED = "SR_CONCURRENT_USER_EXCEED";
export const SR_DAY_TRANSACTION_EXCEED = "SR_DAY_TRANSACTION_EXCEED";
export const SR_GENERAL_FAIL = "SR_GENERAL_FAIL";
export const TTS_SPEAKER_ERROR = "TTS_SPEAKER_ERROR";
export const TTS_INIT_FAIL = "TTS_INIT_FAIL";
export const TTS_GENERAL_FAIL = "TTS_GENERAL_FAIL";
export const CONN_EMPTY_ACCESS_CODE = "CONN_EMPTY_ACCESS_CODE";
export const CONN_INVALID_ACCESS_CODE = "CONN_INVALID_ACCESS_CODE";

// =============================================================================
// Phone Response Types
// =============================================================================

export const PHONE_RESPONSE_CALL_CONNECTED = "Call_Connected";
export const PHONE_RESPONSE_CALL_BUSY = "Call_Busy";
export const PHONE_RESPONSE_CALL_NOANSWER = "Call_NoAnswer";
export const PHONE_RESPONSE_CALL_VOICEMAIL = "Call_VoiceMail";
export const PHONE_RESPONSE_CALL_FAILED = "Call_Failed";
export const PHONE_RESPONSE_CALL_PICKUP_COMPLETE = "Call_Pickup_Complete";
export const PHONE_RESPONSE_CALL_PICKUP_DROPPED = "Call_Pickup_Dropped";
export const PHONE_RESPONSE_CALL_PICKUP_FAILED = "Call_Pickup_Failed";
export const PHONE_RESPONSE_CALL_REJECTED = "Call_Rejected";
export const PHONE_RESPONSE_CALL_REJECT_FAILED = "Call_RejectFailed";
export const PHONE_RESPONSE_CALL_INCOMING = "Call_Incoming";
export const PHONE_RESPONSE_CALL_MISSED = "Call_Missed";
export const PHONE_RESPONSE_CALL_ENDED = "Call_Ended";
export const PHONE_RESPONSE_CALL_HANGUP_COMPLETE = "Call_Hangup_Complete";
export const PHONE_RESPONSE_CALL_HANGUP_FAILED = "Call_Hangup_Failed";
export const PHONE_RESPONSE_SMS_SENT = "SMS_Sent";
export const PHONE_RESPONSE_SMS_FAILED = "SMS_Failed";
export const PHONE_RESPONSE_SMS_RECEIVED = "SMS_Received";
export const PHONE_RESPONSE_SMS_UNSUPPORTED = "SMS_Unsupported";
export const PHONE_RESPONSE_VOICEMAIL_RECEIVED = "VoiceMail_Received";

// =============================================================================
// Phone Request Types
// =============================================================================

export const PHONE_REQUEST_CALL_INITIATE = "Call_Initiate";
export const PHONE_REQUEST_CALL_PICKUP = "Call_Pickup";
export const PHONE_REQUEST_CALL_HANGUP = "Call_Hangup";
export const PHONE_REQUEST_CALL_REJECT = "Call_Reject";
export const PHONE_REQUEST_SMS_SEND = "SMS_Send";

// =============================================================================
// Navigation Command Status Codes
// =============================================================================

export const NAVI_STATUS_SUCCESS = "Success";
export const NAVI_STATUS_FAILURE_NO_DESTINATION = "NoDestination";
export const NAVI_STATUS_FAILURE_INVALID_DESTINATION = "InvalidDestination";
export const NAVI_STATUS_FAILURE_HOME_NOT_FOUND = "MyHomeNotFound";
export const NAVI_STATUS_FAILURE_NOT_INSTALLED = "AnyNaviNotInstalled";
export const NAVI_STATUS_FAILURE_SERVICE_EXPIRED = "ServiceExpired";
export const NAVI_STATUS_FAILURE_UNSUPPORTED = "Unsupported";
export const NAVI_STATUS_FAILURE_NOT_DONE = "NotDone";

// =============================================================================
// System Internal Messages
// =============================================================================

export const START_OVER_MESSAGE = "Let's start over from the beginning.";
export const CONNECTIONLOST_NPCOMMAND = "CONNECTIONLOST_NPCOMMAND";

// =============================================================================
// UI & Sound
// =============================================================================

export const DENIED_UI_SOUND = "denybeep3.wav";
export const NIL_FLAG = "<NIL>";

// =============================================================================
// TTS Related
// =============================================================================

export const MAX_READOUT_LIST_COUNT = 3;
export const TTS_NUMBER_EN = "Number ";
export const TTS_NUMBER_JA = "番目";
