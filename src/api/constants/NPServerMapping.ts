import { logger, LOG_LEVEL } from "../core/logger";

// Server environment aliases

export const SERVER_URL_MAPPING: Record<string, string> = {
  dev: "https://npka-npjwi-dev.inago.com",
  staging: "https://npka-npjwi-stg.inago.com",
  live: "https://npka-npjwi-lv.inago.com",
  edge: "http://192.168.123.85:9000",
  newdev: "https://npka-npjwi-dev.inago.com/nextgen/",
  teltonika: "http://192.168.1.100:9000",
} as const;

export const getServerKeyFromUrl = (url: string): string | null => {
  const entry = Object.entries(SERVER_URL_MAPPING).find(([_, value]) => value === url);
  return entry ? entry[0] : null;
};

export const getServerUrlFromKey = (key: string): string | null => {
  if (!SERVER_URL_MAPPING[key]) {
    return null;
  }
  return SERVER_URL_MAPPING[key];
};

export const getNPJWIEnv = (): string => {
  const npjwiUrl = (window as any)?.env_config?.NPJWI_ENV || "dev";
  logger.Log(LOG_LEVEL.LOG_Debug, "[NPClientProvider] NPJWI URL: " + npjwiUrl); 
  return npjwiUrl
};

export const getNPJWIUrl = (): string => {
  return SERVER_URL_MAPPING[getNPJWIEnv()];
};
