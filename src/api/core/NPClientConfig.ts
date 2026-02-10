/**
 * NPClient Configuration Manager
 * Singleton configuration class for shared configuration across all files
 * Adapt from m_config in NPClient_JSON.js in SDK
 * Reference to NPC_NATIVEAPP for config.
 */

export interface NPClientConfigData {
  // Server settings
  appID: string;
  accessCode: string;
  remoteServer: {
    agentID: string,
    startupParams: string,
    gateway: string,
    serverUrl: string
  },

  // User
  userID: string;
  userName: string;
//   preferenceDefXml: string;
  userPreference: string; 
  
  // Client info
  clientID: string;
  clientType: string;
  clientDesign: string;
  clientVersion: string;
  clientTimeZoneAdjust: number;
  
  // Session settings
  languageCode: string;

}

class NPClientConfigManager {
  private static instance: NPClientConfigManager;
  private config!: NPClientConfigData;

  private constructor() {
    // Initialize with default configuration
    this.reset();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): NPClientConfigManager {
    if (!NPClientConfigManager.instance) {
      NPClientConfigManager.instance = new NPClientConfigManager();
    }
    return NPClientConfigManager.instance;
  }

  /**
   * Get entire config (returns a copy)
   */
  getConfig(): NPClientConfigData {
    return { ...this.config };
  }

  /**
   * Get direct reference to config object (allows direct property access)
   * WARNING: Returns actual object, not a copy. Changes will affect all files.
   * @example const cfg = NPClientConfig.getConfigObject(); cfg.accessCode = "111";
   */
  getConfigObject(): NPClientConfigData {
    return this.config;
  }

  /**
   * Get specific config value
   * @example NPConfig.get('serverUrl')
   */
  get<K extends keyof NPClientConfigData>(key: K): NPClientConfigData[K] {
    return this.config[key];
  }

  /**
   * Set specific config value
   * @example NPConfig.set('sessionTimeout', 120000)
   */
  set<K extends keyof NPClientConfigData>(
    key: K,
    value: NPClientConfigData[K]
  ): void {
    this.config[key] = value;
  }

  /**
   * Update multiple config values at once
   * @example NPConfig.update({ appId: 'xyz', userId: 'abc' })
   */
  update(updates: Partial<NPClientConfigData>): void {
    // this.config = { ...this.config, ...updates };
    Object.assign(this.config, updates);
  }

  /**
   * Reset config to default values
   */
  reset(): void {
    this.config = {
      appID: "",
      accessCode: "",
      remoteServer: {
        agentID: "",
        startupParams: "",
        gateway: "true",
        serverUrl: ""
      },
      userID: "",
      userName: "",
      languageCode: "en",
      userPreference: "",
      
      clientID: "MiaBrowserClient",
      clientType: "WebBrowser",
      clientDesign: "NoDesign",
      clientVersion: "NPBC 5.0.0",
      clientTimeZoneAdjust: new Date().getTimezoneOffset(),
    };
  }

  /**
   * Check if a config key has been set (not empty)
   */
  isSet(key: keyof NPClientConfigData): boolean {
    const value = this.config[key];
    return value !== "" && value !== null && value !== undefined;
  }
}

// Export singleton instance
export const NPClientConfig = NPClientConfigManager.getInstance();

// Export direct config object for simpler syntax
export const m_config = NPClientConfig.getConfigObject();

/**
 * Usage Examples:
 * 
 * // Method 1: Using NPClientConfig methods (type-safe)
 * import { NPClientConfig } from '@/api/core/NPClientConfig';
 * 
 * NPClientConfig.set('appId', 'O8gdGVFk40nd');
 * const timeout = NPClientConfig.get('sessionTimeout');
 * 
 * // Method 2: Using m_config directly (simpler, direct access)
 * import { m_config } from '@/api/core/NPClientConfig';
 * 
 * m_config.accessCode = "111";
 * m_config.sessionTimeout = 120000;
 * const appId = m_config.appId;
 * 
 * // Both methods modify the SAME singleton object!
 * // Changes made with either method will be visible everywhere.
 * 
 * // Bulk update
 * NPClientConfig.update({
 *   appId: 'O8gdGVFk40nd',
 *   userId: 'Q9mA60HnY87C1TW5kjAZ6Q',
 *   accessCode: '4fe1ac',
 * });
 * 
 * // Get entire config
 * const allConfig = NPClientConfig.getConfig();
 * 
 * // Check if value is set
 * if (NPClientConfig.isSet('appId')) {
 *   // appId has been configured
 * }
 * 
 * // Reset to defaults
 * NPClientConfig.reset();
 */
