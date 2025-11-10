import { Request, Response, NextFunction } from 'express';
import { logger } from '../infrastructure/logger';

// Placeholder for future authentication/authorization.
// Currently it only logs the request path and allows it.
export function authPlaceholder(req: Request, _res: Response, next: NextFunction) {
  logger.debug({ path: req.path }, 'auth placeholder pass-through');
  next();
}
