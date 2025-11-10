import { app } from './app';
import { config } from './shared/config/env';
import { logger } from './infrastructure/logger';

app.listen(config.port, () => {
  logger.info({ port: config.port }, 'API Gateway listening');
});
