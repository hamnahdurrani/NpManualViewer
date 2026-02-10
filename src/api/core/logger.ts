//-------------------------------------------
// Logging support module
//
// v1.0.1
//
// Copyright 2019 - iNAGO Incorporated
//
// Adopted code from Gary Farmer's Logger
//
//-------------------------------------------

export const LOG_LEVEL =  {
    LOG_None : "None",
    LOG_ExTrace : "ExTrace",
    LOG_Trace : "Trace",
    LOG_Debug : "Debug",
    LOG_Info : "Info",
    LOG_Warning : "Warning",
    LOG_Error : "Error",
    LOG_Critical : "Critical",
    LOG_System : "System"
} as const

type LEVEL_NAMES = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];

class Logger {
    private m_loggingLevel: LEVEL_NAMES = LOG_LEVEL.LOG_Trace;
    private m_debug_mode: boolean = false;

    constructor() {
        if (window?.location?.search) {
            const urlParams = new URLSearchParams(window.location.search);
            this.m_debug_mode = urlParams.get("debugMode") === "on";
        }
    }

    Log(level: LEVEL_NAMES, msg: string) {
        if (this.m_loggingLevel == LOG_LEVEL.LOG_None || !this.m_debug_mode) {
            return;
        }

        // if (level == LOG_LEVEL.LOG_System || level >= this.m_loggingLevel) {
            var cdt = this.GetDateTime();
            console.log(cdt + " - " + level + " - " + msg);
            // console.log(level, level + " - " + msg);
        // }
    }

    GetDateTime(): string {
        var cdt = new Date();

        var dt = cdt.getFullYear() + "/" + this.D2(cdt.getMonth()+1) + "/" + this.D2(cdt.getDate());
        var tm = this.D2(cdt.getHours()) + ":" + this.D2(cdt.getMinutes()) + ":" + this.D2(cdt.getSeconds()) + "." + this.D3(cdt.getMilliseconds())

        return dt + " " + tm;
    }

    D2(v: number): string {
        var str = v.toString();

        if (str.length >= 2) {
            return str;
        }

        return ("00" + str).substr(str.length);
    }

    D3(v: number): string {
        var str = v.toString();

        if (str.length >= 3) {
            return str;
        }

        return ("000" + str).substr(str.length);
    }
}

export const logger = new Logger();