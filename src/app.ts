import express from 'express';
import { registerMiddlewares } from './middlewares';
import { registerSystemRoutes } from './routes/systemRoutes';
import { mountProxies } from './infrastructure/proxy';
import { notFoundHandler, errorHandler } from './middlewares/errors';

export const app = express();

// Middlewares (body parsing, auth placeholders)
registerMiddlewares(app);

// System / documentation routes (health, swagger)
registerSystemRoutes(app);

// Proxy configuration (BFF routes)
mountProxies(app);

// 404 + error handling
app.use(notFoundHandler);
app.use(errorHandler);
