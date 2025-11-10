import express from 'express';
import { authToken } from './authToken';
import { authPlaceholder } from './authPlaceholder';

export function registerMiddlewares(app: express.Express) {
  app.use(express.json());
  app.use(authToken);
  app.use(authPlaceholder);
}
