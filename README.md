# 🏦 Sistema de Pagamentos - Backend API

API REST completa para gerenciamento de clientes e cobranças com sistema de idempotência e tratamento robusto de erros.

## 📑 Índice

- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#️-instalação-e-configuração)
- [Arquitetura](#️-arquitetura)
- [Endpoints da API](#-endpoints-da-api)
- [Sistema de Idempotência](#-sistema-de-idempotência)
- [Tratamento de Erros](#-tratamento-de-erros)
- [Testando a API](#-testando-a-api)
- [Banco de Dados](#-banco-de-dados)
- [Docker](#-docker)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Tecnologias

- **Node.js 22** - Runtime JavaScript
- **Express.js 5** - Framework web
- **Prisma ORM** - ORM moderno para Node.js
- **PostgreSQL 15** - Banco de dados relacional
- **Docker & Docker Compose** - Containerização

---

## ✨ Funcionalidades

### ✅ Implementado

- [x] **CRUD completo de Clientes**
  - Criar, listar, buscar por ID e deletar clientes
  - Validações robustas de dados
  - Prevenção de duplicação (email e documento únicos)

- [x] **CRUD completo de Cobranças**
  - Criar e consultar cobranças
  - Suporte para 3 métodos de pagamento: PIX, CARTÃO, BOLETO
  - Validações específicas por tipo de pagamento
  - Relacionamento com clientes

- [x] **Sistema de Idempotência**
  - Prevenção de requisições duplicadas
  - Armazenamento de respostas por 24 horas
  - Header `Idempotency-Key` opcional

- [x] **Tratamento Global de Erros**
  - Classes customizadas de erro
  - Middleware global de tratamento
  - Respostas padronizadas
  - Tratamento específico de erros do Prisma

- [x] **Validações em Camadas**
  - Middlewares de validação
  - Validações de negócio nos services
  - Validações de formato e tipo

- [x] **Collection Insomnia**
  - Todos os endpoints documentados
  - Testes de validação incluídos
  - Variáveis de ambiente configuradas

---

## 📋 Pré-requisitos

- Node.js 22+ instalado
- Docker e Docker Compose instalados
- npm ou yarn
- Git (para clonar o repositório)

---

## ⚙️ Instalação e Configuração

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd "Desafio Backend-Sistema de Pagamentos"
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

O arquivo `.env` já está configurado:

```env
DATABASE_URL="postgresql://postgres:140610@localhost:5432/payment_system?schema=public"
PORT=3000
NODE_ENV=development
```

### 4. Iniciar banco de dados PostgreSQL

```bash
docker-compose up -d
```

Verificar se está rodando:
```bash
docker-compose ps
```

### 5. Executar migrations do Prisma

```bash
npx prisma migrate dev --schema=./prisma/schema.prisma
```

Ou se preferir:
```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### 6. Gerar Prisma Client

```bash
npx prisma generate --schema=./prisma/schema.prisma
```

### 7. Iniciar servidor

```bash
# Modo desenvolvimento (com nodemon - hot reload)
npm run dev

# Modo produção
npm start
```

O servidor estará disponível em: **`http://localhost:3000`**

Resposta esperada ao acessar `/`:
```json
{
  "success": true,
  "message": "API Sistema de Pagamentos",
  "version": "1.0.0"
}
```

---

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
src/
├── config/              # Configurações (env vars)
├── controllers/         # Lógica de requisições HTTP
│   ├── customerController.js
│   └── chargeController.js
├── services/            # Regras de negócio e validações
│   ├── customerService.js
│   └── chargeService.js
├── repositories/        # Acesso a dados (Prisma)
│   ├── customerRepository.js
│   └── chargeRepository.js
├── middlewares/         # Middlewares customizados
│   ├── errorHandler.js          # Tratamento global de erros
│   ├── idempotency.js           # Sistema de idempotência
│   ├── customerValidation.js    # Validação de customers
│   └── chargeValidation.js      # Validação de charges
├── routes/              # Definição de rotas
│   ├── customerRoutes.js
│   └── chargeRoutes.js
├── utils/               # Utilitários
│   └── errors.js        # Classes de erro customizadas
├── app.js              # Configuração do Express
└── server.js           # Inicialização do servidor

prisma/
├── schema.prisma       # Schema do banco de dados
└── migrations/         # Histórico de migrations
```

### Fluxo de Requisição

```
Cliente → Route → Middleware Validação → Middleware Idempotência → 
Controller → Service → Repository → Prisma → PostgreSQL
```

### Camadas e Responsabilidades

1. **Routes**: Define endpoints e associa middlewares
2. **Middlewares**: Validação, idempotência, autenticação
3. **Controllers**: Recebe requisições e retorna respostas
4. **Services**: Lógica de negócio e regras
5. **Repositories**: Acesso aos dados (Prisma)
6. **Utils**: Funções auxiliares e classes customizadas

---

## 📡 Endpoints da API

### Base URL
```
http://localhost:3000/api
```

---

### 👥 CRUD de Clientes

#### 1. Criar Cliente

```http
POST /api/customers
Content-Type: application/json
Idempotency-Key: uuid-unico (opcional)

{
  "nome": "João Silva",
  "email": "joao.silva@email.com",
  "documento": "12345678900",
  "telefone": "11987654321"
}
```

**Validações:**
- Nome: obrigatório, 3-100 caracteres
- Email: obrigatório, formato válido, único
- Documento: obrigatório, CPF (11) ou CNPJ (14 dígitos), único
- Telefone: obrigatório, 10-11 dígitos

**Resposta (201):**
```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "João Silva",
    "email": "joao.silva@email.com",
    "documento": "12345678900",
    "telefone": "11987654321",
    "createdAt": "2025-10-21T14:42:00.000Z",
    "updatedAt": "2025-10-21T14:42:00.000Z"
  }
}
```

#### 2. Listar Clientes

```http
GET /api/customers
```

**Resposta (200):**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

#### 3. Buscar Cliente por ID

```http
GET /api/customers/:id
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nome": "João Silva",
    ...
  }
}
```

#### 4. Deletar Cliente

```http
DELETE /api/customers/:id
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Cliente removido com sucesso"
}
```

---

### 💳 CRUD de Cobranças

#### 1. Criar Cobrança - PIX

```http
POST /api/charges
Content-Type: application/json
Idempotency-Key: uuid-unico (opcional)

{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "valor": 100.50,
  "moeda": "BRL",
  "metodo_pagamento": "PIX"
}
```

**Validações PIX:**
- ❌ Não aceita parcelas
- ❌ Não aceita data de vencimento

#### 2. Criar Cobrança - CARTÃO

```http
POST /api/charges
Content-Type: application/json

{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "valor": 500.00,
  "moeda": "BRL",
  "metodo_pagamento": "CARTAO",
  "parcelas": 3
}
```

**Validações CARTÃO:**
- ✅ Pode ter parcelas (1-12, opcional)
- ❌ Não aceita data de vencimento

#### 3. Criar Cobrança - BOLETO

```http
POST /api/charges
Content-Type: application/json

{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "valor": 250.00,
  "moeda": "BRL",
  "metodo_pagamento": "BOLETO",
  "data_vencimento": "2025-11-30T00:00:00.000Z"
}
```

**Validações BOLETO:**
- ✅ Deve ter data de vencimento (obrigatório, não pode ser no passado)
- ❌ Não aceita parcelas

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Cobrança criada com sucesso",
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "valor": 250.00,
    "moeda": "BRL",
    "metodo_pagamento": "BOLETO",
    "status": "PENDENTE",
    "data_vencimento": "2025-11-30T00:00:00.000Z",
    "parcelas": null,
    "createdAt": "2025-10-21T...",
    "updatedAt": "2025-10-21T...",
    "customer": {
      "id": "uuid",
      "nome": "João Silva",
      ...
    }
  }
}
```

#### 4. Listar Cobranças

```http
GET /api/charges
```

**Resposta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "valor": 100.50,
      "metodo_pagamento": "PIX",
      "status": "PENDENTE",
      "customer": {...}
    },
    ...
  ],
  "count": 5
}
```

#### 5. Buscar Cobrança por ID

```http
GET /api/charges/:id
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "valor": 250.00,
    "metodo_pagamento": "BOLETO",
    "status": "PENDENTE",
    "customer": {...}
  }
}
```

---

## 🔄 Sistema de Idempotência

### O que é?

Idempotência garante que múltiplas requisições idênticas produzam o mesmo resultado que uma única requisição, evitando duplicações acidentais.

### Como usar?

Adicione o header `Idempotency-Key` com um UUID único:

```http
POST /api/customers
Content-Type: application/json
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440001

{
  "nome": "João Silva",
  ...
}
```

### Comportamento

1. **Primeira requisição**: Processa normalmente e armazena a resposta
2. **Requisições subsequentes (mesma chave)**: Retorna a resposta armazenada sem processar novamente
3. **Expiração**: Chaves expiram após 24 horas

### Quando usar?

- ✅ Criar cliente
- ✅ Criar cobrança
- ✅ Processar pagamento
- ❌ Listagens (GET)
- ❌ Buscas (GET)
- ❌ Exclusões (já são idempotentes)

**Nota**: O header é opcional mas **altamente recomendado** para operações críticas.

---

## 🛡️ Tratamento de Erros

### Status Codes Utilizados

| Código | Significado | Quando Ocorre |
|--------|-------------|---------------|
| 200 | OK | Operação bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos ou validação falhou |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito de dados (duplicação) |
| 500 | Internal Server Error | Erro interno do servidor |

### Formato de Resposta de Erro

```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": ["detalhe 1", "detalhe 2"]
}
```

### Exemplos de Erros

**Validação (400):**
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [
    "Nome deve ter pelo menos 3 caracteres",
    "Email inválido",
    "Telefone deve ter 10 ou 11 dígitos"
  ]
}
```

**Recurso Não Encontrado (404):**
```json
{
  "success": false,
  "message": "Cliente não encontrado"
}
```

**Conflito (409):**
```json
{
  "success": false,
  "message": "Email já cadastrado"
}
```

**Regras de Pagamento (400):**
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [
    "Pagamento via PIX não aceita parcelas"
  ]
}
```

---

## 🧪 Testando a API

### Opção 1: Collection Insomnia (Recomendado)

1. Instale o [Insomnia](https://insomnia.rest/download)
2. Importe o arquivo `insomnia-collection.json`
3. Configure as variáveis de ambiente
4. Execute as requisições

**Variáveis disponíveis:**
- `base_url`: http://localhost:3000
- `customer_id`: UUID de cliente para testes
- `charge_id`: UUID de cobrança para testes
- `idempotency_key_*`: UUIDs para teste de idempotência

### Opção 2: cURL

#### Criar Cliente
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "documento": "12345678900",
    "telefone": "11987654321"
  }'
```

#### Listar Clientes
```bash
curl http://localhost:3000/api/customers
```

#### Buscar Cliente por ID
```bash
curl http://localhost:3000/api/customers/{id}
```

#### Criar Cobrança PIX
```bash
curl -X POST http://localhost:3000/api/charges \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "{customer_id}",
    "valor": 100.50,
    "moeda": "BRL",
    "metodo_pagamento": "PIX"
  }'
```

#### Criar Cobrança com Boleto
```bash
curl -X POST http://localhost:3000/api/charges \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "{customer_id}",
    "valor": 250.00,
    "moeda": "BRL",
    "metodo_pagamento": "BOLETO",
    "data_vencimento": "2025-12-31T00:00:00.000Z"
  }'
```

#### Listar Cobranças
```bash
curl http://localhost:3000/api/charges
```

### Opção 3: Postman

Importe os endpoints usando a documentação acima ou converta a collection do Insomnia.

---

## 📊 Banco de Dados

### Schema Prisma

```prisma
model Customer {
  id          String   @id @default(uuid())
  nome        String
  email       String   @unique
  documento   String   @unique
  telefone    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  charges     Charge[]
}

model Charge {
  id               String          @id @default(uuid())
  customerId       String
  valor            Float
  moeda            String
  metodo_pagamento MetodoPagamento
  status           StatusPagamento
  data_vencimento  DateTime?
  parcelas         Int?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
}

model IdempotencyKey {
  id             String   @id @default(uuid())
  requestKey     String   @unique
  responseStatus Int
  responseBody   String   @db.Text
  createdAt      DateTime @default(now())
  expiresAt      DateTime
}

enum MetodoPagamento {
  PIX
  CARTAO
  BOLETO
}

enum StatusPagamento {
  PENDENTE
  PAGO
  FALHADO
  EXPIRADO
}
```

### Acessar PostgreSQL via Docker

```bash
docker exec -it postgres-payment psql -U postgres -d payment_system
```

**Comandos úteis no psql:**
```sql
-- Listar tabelas
\dt

-- Ver estrutura da tabela
\d "Customer"
\d "Charge"

-- Consultar clientes
SELECT * FROM "Customer";

-- Consultar cobranças com cliente
SELECT c.*, cu.nome as cliente_nome 
FROM "Charge" c 
JOIN "Customer" cu ON c."customerId" = cu.id;

-- Ver chaves de idempotência
SELECT * FROM "IdempotencyKey";

-- Sair
\q
```

### Comandos Prisma Úteis

```bash
# Ver banco de dados no Prisma Studio
npx prisma studio --schema=./prisma/schema.prisma

# Resetar banco de dados (⚠️ APAGA TODOS OS DADOS)
npx prisma migrate reset --schema=./prisma/schema.prisma

# Criar nova migration
npx prisma migrate dev --name nome_da_migration --schema=./prisma/schema.prisma

# Aplicar migrations em produção
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Gerar Prisma Client
npx prisma generate --schema=./prisma/schema.prisma

# Formatar schema
npx prisma format --schema=./prisma/schema.prisma
```

---

## 🐳 Docker

### docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: postgres-payment
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 140610
      POSTGRES_DB: payment_system
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Comandos Docker Úteis

```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Parar e remover volumes (⚠️ APAGA DADOS)
docker-compose down -v

# Ver logs
docker-compose logs -f postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver status
docker-compose ps

# Entrar no container
docker exec -it postgres-payment bash
```

---

## 🔧 Troubleshooting

### Porta 3000 já está em uso

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:3000 | xargs kill -9
```

Ou altere a porta no arquivo `.env`:
```env
PORT=3001
```

### Prisma Client não encontrado

```bash
npx prisma generate --schema=./prisma/schema.prisma
```

### Erro de conexão com PostgreSQL

```bash
# Verificar se o container está rodando
docker ps

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Recriar container
docker-compose down
docker-compose up -d
```

### Migrations não aplicadas

```bash
# Ver status das migrations
npx prisma migrate status --schema=./prisma/schema.prisma

# Aplicar migrations pendentes
npx prisma migrate dev --schema=./prisma/schema.prisma

# Resetar e reaplicar tudo (⚠️ APAGA DADOS)
npx prisma migrate reset --schema=./prisma/schema.prisma
```

### Erro "EPERM: operation not permitted"

Isso pode acontecer no Windows ao gerar o Prisma Client. Feche o VS Code ou qualquer IDE e tente novamente:

```bash
npx prisma generate --schema=./prisma/schema.prisma
```

### JSON inválido no corpo da requisição

Certifique-se de:
1. Usar `Content-Type: application/json` no header
2. Enviar JSON válido (sem vírgulas extras, aspas corretas)
3. Testar com ferramentas como Insomnia ou Postman

---

## 📚 Documentação Adicional

- **Insomnia Collection**: `insomnia-collection.json` - Collection completa com todos os endpoints e testes
- **Prisma Schema**: `prisma/schema.prisma` - Definição do banco de dados

---

## 🎯 Checklist de Funcionalidades

### Clientes
- [x] Criar cliente
- [x] Listar clientes
- [x] Buscar cliente por ID
- [x] Deletar cliente
- [x] Validações de dados
- [x] Prevenção de duplicação

### Cobranças
- [x] Criar cobrança PIX
- [x] Criar cobrança CARTÃO
- [x] Criar cobrança BOLETO
- [x] Listar cobranças
- [x] Buscar cobrança por ID
- [x] Validações por método de pagamento
- [x] Relacionamento com cliente
- [x] Status inicial PENDENTE

### Sistema
- [x] Tratamento global de erros
- [x] Classes customizadas de erro
- [x] Middlewares de validação
- [x] Sistema de idempotência
- [x] Respostas padronizadas
- [x] Logs de erro
- [x] Collection Insomnia
- [x] Documentação completa

---

## 🚧 Possíveis Melhorias Futuras

- [ ] Autenticação JWT
- [ ] Autorização baseada em papéis
- [ ] Paginação nas listagens
- [ ] Filtros e busca avançada
- [ ] Webhooks para notificações
- [ ] Processamento assíncrono com filas
- [ ] Cache com Redis
- [ ] Rate limiting
- [ ] Documentação Swagger/OpenAPI
- [ ] Testes unitários e de integração
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento e métricas
- [ ] Logs estruturados

---

## 📄 Licença

ISC

---

## 👨‍💻 Desenvolvimento

**Versão**: 1.0.0  
**Node.js**: 22+  
**Database**: PostgreSQL 15  

Para reportar bugs ou sugerir melhorias, abra uma issue no repositório.

---

## 📞 Suporte

Para dúvidas sobre o uso da API:
1. Consulte esta documentação
2. Verifique a seção de [Troubleshooting](#-troubleshooting)
3. Revise os exemplos na collection do Insomnia
4. Verifique os logs do servidor

**Logs do servidor mostram**:
- Requisições recebidas
- Erros capturados
- Requisições duplicadas detectadas
- Conexões com banco de dados
