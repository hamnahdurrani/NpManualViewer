/**
 * AuthManager
 * 
 * Manages authentication credentials and server configuration.
 * Handles URL parameters, localStorage persistence, and server alias mapping.
 */

import { SERVER_URL_MAPPING } from "../constants/NPServerMapping";
import { logger, LOG_LEVEL } from "./logger";

export const AUTH_STORAGE_KEYS = {
  ACCESS_CODE: "NPBC_accessCode",
  USER_ID: "NPBC_userID",
} as const;

export interface AuthCredentials {
  accessCode: string | null;
  userID: string | null;
}

export class AuthManager {
  /**
   * Get authentication credentials with priority:
   * 1. URL parameters (highest)
   * 2. localStorage (fallback)
   * 3. null if neither exist
   */
  static getCredentials(): AuthCredentials {
    const creditials = {
        accessCode: localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_CODE),
        userID: localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID),
        // server: localStorage.getItem(AUTH_STORAGE_KEYS.SERVER),
    }
    // Read URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlAccessCode = urlParams.get("accessCode");
    const urlUserID = urlParams.get("userID");
    // const urlServer = urlParams.get("server");


    // Check if URL has any credentials
    if (urlAccessCode) {
        creditials.accessCode = urlAccessCode;
    }
    if (urlUserID) {
        creditials.userID = urlUserID;
    }
    // if (urlServer) {
    //     creditials.server = urlServer;
    // }

    return creditials;
  }

  /**
   * Resolve server alias to actual URL
   * If not an alias, return as-is (direct URL)
   */
  static resolveServerURL(serverInput: string): string | null {
    // Check if it's an alias
    if (serverInput in SERVER_URL_MAPPING) {
      return SERVER_URL_MAPPING[serverInput as keyof typeof SERVER_URL_MAPPING];
    }
    // Return as direct URL
    return null;
  }

  /**
   * Save authentication credentials to localStorage
   */
  static saveCredentials(credentials: {
    accessCode: string;
    userID: string;
    // server: string;
  }): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_CODE, credentials.accessCode);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER_ID, credentials.userID);
      // localStorage.setItem(AUTH_STORAGE_KEYS.SERVER, credentials.server);
      logger.Log(LOG_LEVEL.LOG_Debug, "[AuthManager] Credentials saved to localStorage");
    } catch (error) {
      logger.Log(LOG_LEVEL.LOG_Error, "[AuthManager] Failed to save to localStorage: " + error);
    }
  }

  /**
   * Clear authentication credentials from localStorage
   */
  static clearCredentials(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_CODE);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER_ID);
      // localStorage.removeItem(AUTH_STORAGE_KEYS.SERVER);
      logger.Log(LOG_LEVEL.LOG_Debug, "[AuthManager] Credentials cleared from localStorage");
    } catch (error) {
      logger.Log(LOG_LEVEL.LOG_Error, "[AuthManager] Failed to clear localStorage: " + error);
    }
  }

}
