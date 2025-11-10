import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

function removeTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

export const config = {
  port: parseInt(requireEnv('PORT', '3001'), 10),
  bffBaseUrl: removeTrailingSlash(requireEnv('BFF_BASE_URL')), // normalize
  logLevel: requireEnv('LOG_LEVEL', 'info'),
};

export type AppConfig = typeof config;
