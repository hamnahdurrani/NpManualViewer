import { logger, LOG_LEVEL } from "./logger";

export const SETTINGS_STORAGE_KEYS = {
  userName: "NPBC_userName",
  languageCode: "NPBC_languageCode",
  // ttsEnabled: "NPBC_ttsEnabled",
} as const;

export interface UserSettings {
  userName: string;
  languageCode: string;
  // ttsEnabled: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  userName: "",
  languageCode: "en",
  // ttsEnabled: true,
};

export class SettingsManager {
  /** Read all settings */
  static getSettings(): UserSettings {
    return {
      userName: this.getValue("userName"),
      languageCode: this.getValue("languageCode"),
    };
  }

  /** Save settings */
  static saveSettings(patch: Partial<UserSettings>): boolean {
    console.log("[SettingsManager] Saving settings: ", patch);
    const currentSettings = this.getSettings();
    let changed = false;

    (Object.keys(patch) as (keyof UserSettings)[]).forEach((key) => {
      const newValue = patch[key];
      if (newValue == null || newValue == undefined) return;

      const currentValue = currentSettings[key];
      if (Object.is(currentValue, newValue)) return;

      this.setValue(key, newValue);
      changed = true;
    });

    if (!changed) {
      logger.Log(LOG_LEVEL.LOG_Debug, "[SettingsManager] No settings changes detected");
    }

    return changed;
  }

  /** Clear all settings */
  static clearSettings() {
    Object.values(SETTINGS_STORAGE_KEYS).forEach((key) =>
      localStorage.removeItem(key)
    );
    logger.Log(LOG_LEVEL.LOG_Debug, "[SettingsManager] Settings cleared");
  }

  private static getValue(key: keyof UserSettings): string | null {
    try {
      return localStorage.getItem(SETTINGS_STORAGE_KEYS[key]) ?? DEFAULT_SETTINGS[key];
    } catch (error) {
      logger.Log(LOG_LEVEL.LOG_Error, "[SettingsManager] Failed to get value from storage: " + error);
      return null;
    }
  }

  private static setValue(key: keyof UserSettings, value: string): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEYS[key], value);
    } catch (error) {
      logger.Log(LOG_LEVEL.LOG_Error, "[SettingsManager] Failed to set value to storage: " + error);
    }
  }
}
