import { Request, Response, NextFunction } from 'express';
import { logger } from '../infrastructure/logger';

// Placeholder para futura validação de token JWT / API Key.
// Responsabilidades previstas:
// 1. Extrair token de Authorization: Bearer <token>
// 2. Validar assinatura e expiração
// 3. Carregar claims (roles, scopes, userId) e anexar em req.auth
// 4. Em caso de falha, retornar 401 ou 403 conforme contexto
// Implementação real ficará em outro momento. Aqui apenas logamos.

export interface AuthContext {
  token?: string;
  userId?: string;
  roles?: string[];
  scopes?: string[];
  rawClaims?: Record<string, unknown>;
}

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthContext;
  }
}

export function authToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring('Bearer '.length).trim();
    // Aqui no futuro: verificar assinatura e decodificar claims.
    req.auth = { token };
    logger.debug({ hasToken: true, path: req.path }, 'auth token placeholder');
  } else {
    logger.debug({ hasToken: false, path: req.path }, 'auth token missing');
  }
  return next();
}
