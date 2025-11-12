# AKI API Gateway

Gateway em Node.js/TypeScript que abstrai chamadas dos microfrontends (Teacher / Student) para o BFF, servindo como ponto de entrada único.

## Objetivos
- Unificar documentação e entrada HTTP.
- Centralizar autenticação/autorização futura (JWT, roles, rate limiting).
- Fazer proxy transparente das rotas do BFF (com prefixo opcional de versão).
- Evoluir sem quebrar consumidores existentes.

## Arquitetura (Visão Rápida)
| Camada | Papel |
| ------ | ----- |
| `server.ts` | Inicializa Express e carrega app. |
| `app.ts` | Registra middlewares, rotas e proxy. |
| `infrastructure/proxy.ts` | Adapta prefixo de versão e encaminha requisições ao BFF. |
| `infrastructure/swagger.ts` | Carrega spec local ou alternativa via env. |
| `middlewares/*` | Auth placeholder, parsing, logging, erros. |
| `routes/systemRoutes.ts` | Health (`/health`) e docs (`/docs`). |
| `shared/config/env.ts` | Validação e normalização de variáveis de ambiente. |
| `docs/AKI! - API Gateway.yaml` | Fonte editável do Swagger. |

Fluxo: Request -> Middlewares (log/auth placeholder) -> Proxy (ajusta prefixo) -> BFF -> Resposta (tratamento de erros). Swagger e health ficam fora do proxy.

## Estado Atual
- Proxy de rotas raiz e opcionais com `/v1` (controlado por `BFF_VERSION_PREFIX`).
- Endpoints principais expostos diretamente: `/auth`, `/events`, `/classes`, `/students`, `/attendances`, `/student-device`, `/student-attendance`.
- Swagger UI em `/docs`.
- Health check em `/health`.
- Logger estruturado (Pino).
- Autenticação ainda simulada (placeholder).

## Próximos Passos
- Implementar verificação JWT real (chaves públicas, expiração, roles).
- Correlation ID + tracing headers (observability).
- Circuit breaker / retry e timeouts para o BFF.
- Cache leve para respostas estáticas ou listas frequentes.
- Rate limiting básico.

## Configuração Rápida
```bash
cp .env.example .env
npm install
npm run dev
# http://localhost:3001/health | http://localhost:3001/docs
```
Variáveis principais: `PORT`, `BFF_BASE_URL` (obrigatória), `BFF_VERSION_PREFIX` (opcional), `LOG_LEVEL`. Ver validação em `shared/config/env.ts`.

## Docker (Essencial)
```bash
docker build -t aki-api-gateway .
docker run --rm -p 3001:3001 --env-file .env aki-api-gateway
```

## Autores
Camila Delarosa  
Dimitri Delinski  
Guilherme Belo  
Yasmin Carmona

## Licença
Uso interno acadêmico / estudo.
