import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from '../shared/config/env';
import { loadGatewaySwagger } from '../infrastructure/swagger';

export function registerSystemRoutes(app: Express) {
  // Health
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'api-gateway', bff: config.bffBaseUrl });
  });

  // Swagger estático
  const doc = loadGatewaySwagger();
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(doc, { customSiteTitle: 'AKI API Gateway Docs' })
  );
}
