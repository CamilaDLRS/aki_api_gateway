# AKI API Gateway

Gateway em Node/TypeScript que faz a ponte entre os microfrontends (Teacher / Student) e o BFF existente.

## Objetivos

1. Centralizar futura autenticação/autorizações (JWT, roles, rate limiting).
2. Expor documentação (Swagger) unificada para os clients.
3. Fazer proxy de todas as rotas versionadas `/v1` para o BFF atual (mantendo transparência).
4. Permitir evolução incremental sem quebrar os microfrontends.

## Estado Atual (MVP)

- Proxy transparente de `/v1/**` para `BFF_BASE_URL`.
- Também expõe diretamente (sem precisar prefixar /v1) os endpoints raiz: `/auth`, `/events`, `/classes`, `/students`, `/attendances`, `/student-device`, `/student-attendance`.
- Agora o prefixo de versão é opcional: configure `BFF_VERSION_PREFIX=v1` se o BFF exigir `/v1`; caso contrário deixe vazio e o gateway não forçará o prefixo, aceitando chamadas com ou sem `/v1`.
- Health check em `/health`.
- Swagger UI em `/docs` usando arquivo local editável `src/docs/AKI! - API Gateway.yaml`.
- Placeholder de autenticação (`authPlaceholder`) apenas loga e libera.
- Logger estruturado com Pino.

## Próximos Passos Sugeridos

- Implementar autenticação JWT (emitido pelo Personas ou BFF) aqui.
- Substituir placeholder de token em `src/middlewares/authToken.ts` por verificação real (biblioteca JWT, cache de chave pública, roles).
- Cache de respostas estáticas ou lookups frequentes.
- Circuit breaker / retry para chamadas ao BFF.
- Observability (correlation id, tracing headers pass-through).

## Configuração

Copie `.env.example` para `.env` e ajuste se necessário.

Variáveis principais:

```
PORT=3001
BFF_BASE_URL=http://localhost:4000
LOG_LEVEL=debug
# Prefixo de versão opcional (sem barra). Deixe vazio se o BFF não usa.
BFF_VERSION_PREFIX=
# Caminho alternativo para swagger (opcional)
BFF_SWAGGER_PATH=
# URL pública do gateway (para ajustar servers do swagger)
GATEWAY_PUBLIC_URL=
```

Tabela resumida:

| Variável            | Obrigatória | Default    | Descrição                                                        |
| ------------------- | ----------- | ---------- | ---------------------------------------------------------------- |
| PORT                | Não         | 3001       | Porta de escuta do gateway.                                      |
| BFF_BASE_URL        | Sim         | (nenhum)   | URL raiz do BFF a ser proxied.                                   |
| LOG_LEVEL           | Não         | info       | Nível de log Pino (trace, debug, info, warn, error).             |
| BFF_VERSION_PREFIX  | Não         | ""         | Prefixo de versão sem `/` (ex: `v1`). Vazio = não força prefixo. |
| BFF_SWAGGER_PATH    | Não         | ""         | Caminho alternativo para arquivo swagger externo.                |
| GATEWAY_PUBLIC_URL  | Não         | ""         | URL pública usada em `servers` da spec.                          |
| NODE_ENV            | Não         | development| Ambiente (production ativa otimizações).                         |

Validação ocorre em `shared/config/env.ts`.
```

## Swagger /docs

Fonte principal da documentação: `src/docs/AKI! - API Gateway.yaml`.
Edite este arquivo para atualizar título, descrição, servers e endpoints.
Se quiser apontar para outro arquivo use `BFF_SWAGGER_PATH`. Caso o arquivo não exista, um fallback mínimo é servido.

## Scripts

| Script | Função                                   |
| ------ | ---------------------------------------- |
| dev    | Executa em modo desenvolvimento (watch)  |
| build  | Compila TypeScript para `dist/`          |
| start  | Roda a versão compilada                  |
| lint   | Analisa código com ESLint/TypeScript     |
| format | Aplica Prettier em todos os arquivos     |

## Rodando

```bash
npm install
npm run dev
# abrir http://localhost:3001/health
# swagger: http://localhost:3001/docs
```

## Docker

Build da imagem (multi-stage, Node 20 Alpine):

```bash
docker build -t aki-api-gateway .
```

Rodar container:

```bash
docker run --rm -p 3001:3001 --env-file .env aki-api-gateway
```

Health check: `http://localhost:3001/health`
Swagger: `http://localhost:3001/docs`

### Multi-arch (amd64 + arm64)

Se possuir `buildx` configurado:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t miladlrs/aki-api-gateway:latest --push .
```

### Atualização de versão

1. Atualize código e rode `npm run build`.
2. Rode testes/lint: `npm run lint`.
3. Build da imagem.
4. Publique nova tag: `docker tag aki-api-gateway:latest miladlrs/aki-api-gateway:<versao>`.
5. `docker push miladlrs/aki-api-gateway:<versao>`.

## Estrutura

```
src/
	server.ts                 # Bootstrap do express
	app.ts                    # Montagem de middlewares, rotas e proxies
	infrastructure/
		proxy.ts                # Regras de proxy + version prefix
		swagger.ts              # Loader da spec local
		logger.ts               # Pino logger
	routes/
		systemRoutes.ts         # /health e /docs
	middlewares/
		index.ts                # Registro de middlewares
		authToken.ts            # Extração Bearer (placeholder)
		authPlaceholder.ts      # Pass-through (futuro ACL)
		errors.ts               # Handlers de erro/notFound
	shared/
		config/env.ts           # Variáveis e normalização
		errors/ApiError.ts      # Classe de erro custom
	docs/
		AKI! - API Gateway.yaml # Spec editável
```

Arquivos auxiliares:

```
.gitignore       # Padrões ignorados (node_modules, dist, env, etc.)
.dockerignore    # Reduz contexto de build docker
Dockerfile       # Multi-stage build
.eslintrc.json   # Config ESLint + TS + Prettier
.prettierrc      # Regras de formatação
Dockerfile       # Build multi-stage (builder + production)
.dockerignore    # Ignora arquivos desnecessários no contexto
.env.example     # Exemplo de configuração

## Exemplos de Requisição

Sem prefixo de versão (quando `BFF_VERSION_PREFIX` vazio):

```bash
curl -s http://localhost:3001/classes | jq '.[] | {id,name}'
```

Com prefixo (quando `BFF_VERSION_PREFIX=v1`):

```bash
curl -s http://localhost:3001/v1/classes | jq '.[] | {id,name}'
```

Autenticação futura (JWT) – enviar header:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3001/students
```

## Qualidade e Segurança

- ESLint + Prettier asseguram estilo consistente.
- Executar `npm run lint` antes de cada commit/CI.
- Imagem Docker usa Node 20 Alpine e instala somente dependências de produção.
- Próximo passo sugerido: adicionar middleware de correlation id e real validação JWT.
```

## Licença

Uso interno acadêmico / estudo.
