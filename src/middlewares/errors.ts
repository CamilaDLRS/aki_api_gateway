import { Request, Response, NextFunction } from 'express';
import { ApiError, isApiError } from '../shared/errors/ApiError';
import { logger } from '../infrastructure/logger';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new ApiError('Not Found', 404));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (isApiError(err)) {
    logger.warn({ err }, 'api error');
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }
  logger.error({ err }, 'unexpected error');
  return res.status(500).json({ error: 'Internal Server Error' });
}
