import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { logger } from './logger';

// Attempt to resolve swagger file from multiple candidate locations.
function resolveSwaggerPath(): string | undefined {
  // 1. Explicit env override
  if (process.env.BFF_SWAGGER_PATH) {
    const envPath = path.isAbsolute(process.env.BFF_SWAGGER_PATH)
      ? process.env.BFF_SWAGGER_PATH
      : path.join(process.cwd(), process.env.BFF_SWAGGER_PATH);
    if (fs.existsSync(envPath)) return envPath;
    logger.warn({ envPath }, 'Swagger path from BFF_SWAGGER_PATH not found');
  }
  // 2. Dist relative (when bundled) dist/docs/...
  const distPath = path.join(__dirname, '../docs/AKI! - API Gateway.yaml');
  if (fs.existsSync(distPath)) return distPath;
  // 3. Source relative (when only src copied into image) src/docs/...
  const srcPath = path.join(process.cwd(), 'src/docs/AKI! - API Gateway.yaml');
  if (fs.existsSync(srcPath)) return srcPath;
  // 4. Fallback: first .yaml in src/docs
  const docsDir = path.join(process.cwd(), 'src/docs');
  if (fs.existsSync(docsDir)) {
    const candidate = fs
      .readdirSync(docsDir)
      .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))[0];
    if (candidate) return path.join(docsDir, candidate);
  }
  return undefined;
}

// Loads local curated gateway swagger file (single source of truth for /docs) with robust path resolution.
export function loadGatewaySwagger() {
  const resolved = resolveSwaggerPath();
  if (!resolved) {
    logger.error('Swagger specification file not found, serving minimal placeholder spec');
    return {
      openapi: '3.0.3',
      info: {
        title: 'AKI! - API Gateway (Spec missing)',
        version: '0.0.0',
        description: 'Arquivo swagger não encontrado.',
      },
      paths: {},
    };
  }
  try {
    const raw = fs.readFileSync(resolved, 'utf8');
    const parsed = YAML.parse(raw);
    return parsed;
  } catch (e) {
    logger.error({ error: String(e) }, 'Failed to parse swagger file, serving error placeholder');
    return {
      openapi: '3.0.3',
      info: {
        title: 'AKI! - API Gateway (Erro parse)',
        version: '0.0.0',
        description: String(e),
      },
      paths: {},
    };
  }
}
