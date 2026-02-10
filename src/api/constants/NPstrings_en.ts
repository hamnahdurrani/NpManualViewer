/**
 * English Language Strings (v2.7)
 * Localized strings for the NPClient application
 */

// Open/close quotes in HTML character encoding
export const OPEN_QUOTE = "&ldquo;";
export const CLOSE_QUOTE = "&rdquo;";

export const SEARCH_TERM_TOOLTIP = "Click to remove selection";
export const ASR_RETRY_LABEL = "Retry Input";

// SR popup messages
export const SR_MESSAGES: Record<string, string> = {
  RegularWaiting: "Please speak now",
  RegularListening: "Keep speaking …",
  DictationWaiting: "Speak dictation",
  DictationListening: "Getting dictation …",
  AppSwitch: "Switch to your input app",
  RegularError: "Sorry, please say again",
  DictationError: "Speak again",
  Processing: "Processing …",
};

// AgentSays messages
export const SYSTEM_MESSAGES: Record<string, string> = {
  IDS_INITIALIZE: "Initializing...",
  IDS_WAKEUP_ONLINE: "Please say your request...",
  IDS_WAKEUP_OFFLINE: "Remote Agent not avaliable, please say or select limited command from the hints...",
  IDS_CONNECT_MESSAGE: "Connecting to the Voice Assistant...",
  IDS_STARTSESSION: "",
  IDS_CONNFAIL: "Can't connect.",
  IDS_NEGFAIL: "System is busy, please try again later.",
  IDS_CONNECTIONLOST: "Lost connection to remote Agent.",
  IDS_CONNECTIONCLOSED: "The remote Agent has timed out. Expand to full mode to reconnect.",
  IDS_NO_REMOTESESSION: "Remote Agent currently not available.",
  IDS_REMOTEAVAILABLE: "Remote Agent now available.",
  IDS_QUIT: "Do you really want to quit the application?",
  IDS_SETTING_OPEN: "Setting Menu. Please click the menu and edit the setting...",
  IDS_SETTING_CLOSE: "Setting Menu Closed.",
};

// URL
export const PRODUCT_LOGO_URL = "http://www.inago.com";
export const NETPEOPLE_LOGO_URL = "http://www.inago.com";

// Sayfrom guidance
export const GUIDANCE: Record<string, string> = {
  NORMAL_INPUT_WAKEUPOFF: "Click Mic Button to start ➡",
  NORMAL_INPUT_WAKEUPON: 'Say "Hey Mia" or click Mic Button ➡',
  NORMAL_INPUT_KEYBOARD: "Type in here..",
  DICATION_INPUT_KEYBOARD: "Type or edit in the area above ↑",
};

// Local menu strings
export const MENU_STRINGS: Record<string, string> = {
  HELP_CLOSE: '"Close Help"',
  HELP_OPEN: '"Help"',
  DASHBOARD_CLOSE: '"Close Dashboard"',
  DASHBOARD_OPEN: '"Dashboard"',
  SETTING_CLOSE: '"Close Settings"',
  SETTING_OPEN: '"Settings"',
  MINIMIZE: '"Minimize"',
  WINDOWMODE: '"Window Mode"',
  FULLMODE: '"Full Mode"',
  EXIT: '"Close"',
};

// Mouse over Titles
export const MOUSE_OVER_ALTS: Record<string, string> = {
  COMPACTUI: "Tap to Expand",
  DASHBOARD_ICON: "Dashboard",
  HELP_ICON: "Help",
  SUBMENU_OPTIONS: "More menus",
  CLOSE_ICON: "Minimize",
  EXIT_ICON: "Close",
  GOFULLSCREEN_ICON: "To FullScreen",
  GOWINDOWSCREEN_ICON: "To WindowScreen",
  SETTINGS_ICON: "Settings",
  MIC_ICON_NORMAL: "Click to talk",
  MIC_ICON_WAKEUP: 'Say "Hey Mia"',
  MIC_ICON_OFF: "Send keyboard input",
  SPINNER_ICON: "Processing...",
  CANCEL_SR_ICON: "Click to Cancel",
  AGENT_SPEAKING: "Assistant speaking...",
  SEND_ICON: "Click to Send",
  DIC_COMPLETE_ICON: "Dictation Complete",
  DIC_PAUSE_ICON: "Pause Dictation",
  HINTS: "Hints",
  ALTERNATIVES: "Alternatives",
  ACTIONBUTTONS: "Action buttons",
  MAP_ICON: "Map",
  FACEBOOK_ICON: "Facebook",
  TWITTER_ICON: "Twitter",
  MAIL_ICON: "Mail",
  STARTOVER: "Startover with Dashboard",
  OFFLINE: "Disconnected",
};

// Button texts
export const BUTTON_STRINGS: Record<string, string> = {
  BACKBUTTON: '"BacK"',
  SWITCHBUTTON_SHOWRESULTS: "Show Results",
  SWITCHBUTTON_SHOWHINTS: "Show Hints",
  SWITCHBUTTON_NAVIGATE_HERE: '"Navigate There"',
  STARTOVERBUTTON: '"Start Over"',
  ERROR_OK_BUTTON: "OK",
  ERROR_QUIT_BUTTON: "Close",
  QUIT_YES_BUTTON: "Quit",
  QUIT_NO_BUTTON: "Cancel",
};

// System Error Codes messages
// Three values in each Array: An AgentSays, a Visual Notification, and Notification TTS
export const ERROR_MESSAGES: Record<string, [string, string, string]> = {
  INTERNET_CONN_ERROR: [
    "Disconnected",
    "I'm disconnected from the network right now. Please try again later.",
    "I'm disconnected from the network right now. Please try again later.",
  ],
  NPSERVER_CONN_ERROR: [
    "Can't connect",
    "Oh no! I am having a problem connecting with my assistant server. Please quit the application and try again later.",
    "Oh no! I am having a problem connecting with my assistant server. Please quit the application and try again later.",
  ],
  SR_MIC_ERROR: [
    "",
    "I'm having problems with the microphone, so I can't hear you right now. Please quit this application and check your microphone settings.",
    "I'm having problems with the microphone, so I can't hear you right now. Please quit this application and check your microphone settings.",
  ],
  SR_INIT_FAIL: [
    "",
    "I'm having problems initializing the Speech Recognition engine, so I can't talk right now. Please quit this application and try restarting it.",
    "I'm having problems initializing the Speech Recognition engine, so I can't talk right now. Please quit this application and try restarting it.",
  ],
  SR_CONN_FAIL: [
    "",
    "I'm having problems connecting to the Speech Recognition server, so I can't talk right now. Please quit this application, check your Internet connection and restart this app.",
    "I'm having problems connecting to the Speech Recognition server, so I can't talk right now. Please quit this application, check your Internet connection and restart this app.",
  ],
  SR_CONCURRENT_USER_EXCEED: [
    "",
    "I can't listen to your voice right now because I'm a bit overloaded. Please quit this application and check how many other users are connected.",
    "I can't listen to your voice right now because I'm a bit overloaded. Please quit this application and check how many other users are connected.",
  ],
  SR_DAY_TRANSACTION_EXCEED: [
    "",
    "I can't listen to your voice right now because I've exceeded the daily SR transaction limit. Please quit this application.",
    "I can't listen to your voice right now because I've exceeded the daily SR transaction limit. Please quit this application.",
  ],
  SR_GENERAL_FAIL: [
    "",
    "I'm having problems with the Speech Recognition engine. Please quit this application and try restarting it.",
    "I'm having problems with the Speech Recognition engine. Please quit this application and try restarting it.",
  ],
  TTS_SPEAKER_ERROR: [
    "",
    "I'm having problems with the speaker. Please check the hardware speaker settings.",
    "I'm having problems with the speaker. Please check the hardware speaker settings.",
  ],
  TTS_INIT_FAIL: [
    "",
    "I'm having problems initializing the Text to Speech engine.",
    "I'm having problems initializing the Text to Speech engine.",
  ],
  TTS_GENERAL_FAIL: [
    "",
    "I'm having problems with the Text to Speech engine. Please try restarting my application.",
    "I'm having problems with the Text to Speech engine. Please try restarting my application.",
  ],
  CONN_EMPTY_ACCESS_CODE: [
    "Need Assistant Access Code.",
    "Please open User Settings and set your Assistant Access Code.",
    "Please open User Settings and set your Assistant Access Code.",
  ],
  CONN_INVALID_ACCESS_CODE: [
    "Bad Access Code.",
    "Your Assistant Access Code is invalid. Please set a valid code.",
    "Your Assistant Access Code is invalid. Please set a valid code.",
  ],
};

export const TTS_HEADER = " ";