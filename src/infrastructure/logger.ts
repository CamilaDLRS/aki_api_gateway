import pino from 'pino';
import { config } from '../shared/config/env';

export const logger = pino({
  level: config.logLevel,
  base: undefined, // omit pid, hostname
  timestamp: pino.stdTimeFunctions.isoTime,
});
