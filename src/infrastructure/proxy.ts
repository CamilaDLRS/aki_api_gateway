import { Express } from 'express';
import {
  createProxyMiddleware,
  Options as ProxyOptions,
  RequestHandler,
} from 'http-proxy-middleware';
import { logger } from './logger';
import { config } from '../shared/config/env';

const allowedPrefixes = [
  '/auth',
  '/events',
  '/classes',
  '/students',
  '/attendances',
  '/student-device',
  '/student-attendance',
];

function buildPathRewrite(prefix?: string) {
  if (!prefix) return (p: string) => p;
  return (p: string) => `/${prefix}${p}`;
}

export function mountProxies(app: Express) {
  const versionPrefix = process.env.BFF_VERSION_PREFIX?.replace(/^\//, '').trim() || '';

  const gatewayProxyOptions: ProxyOptions = {
    target: config.bffBaseUrl,
    changeOrigin: true,
    pathRewrite: buildPathRewrite(versionPrefix),
    onProxyReq: (_proxyReq, req) => {
      logger.info(
        { path: (req as any).path, method: (req as any).method, versionPrefix },
        'proxy request'
      );
    },
    onProxyRes: (proxyRes, req) => {
      logger.info({ path: (req as any).path, status: proxyRes.statusCode }, 'proxy response');
    },
    onError: (err, _req, res) => {
      const r = res as any;
      logger.error({ err }, 'proxy error');
      r.status(502).json({ error: 'Bad Gateway', message: (err as Error).message });
    },
  };

  allowedPrefixes.forEach((prefix) =>
    app.use(prefix, createProxyMiddleware(gatewayProxyOptions) as RequestHandler)
  );

  // Backward compatibility: strip /v1 when no version prefix configured
  if (!versionPrefix) {
    const stripV1Options: ProxyOptions = {
      target: config.bffBaseUrl,
      changeOrigin: true,
      pathRewrite: { '^/v1': '' },
      onProxyReq: (_proxyReq, req) => {
        logger.info(
          { path: (req as any).path, method: (req as any).method },
          'proxy v1 (stripped) request'
        );
      },
      onProxyRes: (proxyRes, req) => {
        logger.info(
          { path: (req as any).path, status: proxyRes.statusCode },
          'proxy v1 (stripped) response'
        );
      },
      onError: (err, _req, res) => {
        const r = res as any;
        logger.error({ err }, 'proxy v1 (stripped) error');
        r.status(502).json({ error: 'Bad Gateway', message: (err as Error).message });
      },
    };
    app.use('/v1', createProxyMiddleware(stripV1Options) as RequestHandler);
  }
}
