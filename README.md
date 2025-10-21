# 🏦 Sistema de Pagamentos - Backend API

API REST para gerenciamento de clientes e pagamentos.

## 🚀 Tecnologias

- Node.js 22
- Express.js 5
- Prisma ORM
- PostgreSQL 15
- Docker & Docker Compose

## 📋 Pré-requisitos

- Node.js 22+ instalado
- Docker e Docker Compose
- npm ou yarn

## ⚙️ Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Arquivo `.env` já está configurado com:

```env
DATABASE_URL="postgresql://postgres:140610@localhost:5432/payment_system?schema=public"
PORT=3000
NODE_ENV=development
```

### 3. Iniciar banco de dados

```bash
docker-compose up -d
```

Verificar se está rodando:
```bash
docker-compose ps
```

### 4. Executar migrations

```bash
npx prisma migrate dev
```

### 5. Iniciar servidor

```bash
# Modo desenvolvimento (com nodemon)
npm run dev

# Modo produção
npm start
```

O servidor estará disponível em: `http://localhost:3000`

## 📡 Endpoints - CRUD de Customers

### Base URL
```
http://localhost:3000/api
```

### 1. **Criar Cliente**

```http
POST /api/customers
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao.silva@email.com",
  "documento": "12345678900",
  "telefone": "(11) 98765-4321"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "data": {
    "id": "uuid-gerado",
    "nome": "João Silva",
    "email": "joao.silva@email.com",
    "documento": "12345678900",
    "telefone": "(11) 98765-4321",
    "createdAt": "2025-10-20T...",
    "updatedAt": "2025-10-20T..."
  }
}
```

**Erro de Validação (400):**
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [
    "Nome é obrigatório",
    "Email inválido"
  ]
}
```

**Erro de Duplicação (409):**
```json
{
  "success": false,
  "message": "Email já cadastrado"
}
```

### 2. **Listar Todos os Clientes**

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

### 3. **Buscar Cliente por ID**

```http
GET /api/customers/:id
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nome": "João Silva",
    ...
  }
}
```

**Erro (404):**
```json
{
  "success": false,
  "message": "Cliente não encontrado"
}
```

### 4. **Deletar Cliente**

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

## ✅ Validações Implementadas

### Campos Obrigatórios:
- `nome` - não pode ser vazio
- `email` - deve ser válido e único
- `documento` - único no sistema
- `telefone` - obrigatório

### Regras de Negócio:
- Email deve ser único (não pode cadastrar dois clientes com mesmo email)
- Documento deve ser único
- Email deve ter formato válido

## 🏗️ Arquitetura

```
src/
├── config/           # Configurações (env vars)
├── controllers/      # Lógica de requisições HTTP
├── services/         # Regras de negócio e validações
├── repositories/     # Acesso a dados (Prisma)
├── routes/           # Definição de rotas
├── app.js           # Configuração do Express
└── server.js        # Inicialização do servidor
```

### Fluxo de Requisição:

```
Route → Controller → Service → Repository → Prisma → PostgreSQL
```

## 🧪 Testando a API

### Opção 1: VS Code REST Client

Abra o arquivo `customers.http` e clique em "Send Request"

### Opção 2: cURL

```bash
# Criar cliente
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "documento": "12345678900",
    "telefone": "(11) 98765-4321"
  }'

# Listar clientes
curl http://localhost:3000/api/customers

# Buscar por ID
curl http://localhost:3000/api/customers/{id}

# Deletar
curl -X DELETE http://localhost:3000/api/customers/{id}
```

### Opção 3: Postman

Importe a coleção usando os endpoints documentados acima.

## 🐳 Docker

### Comandos Úteis:

```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver status
docker-compose ps
```

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
}
```

### Acessar PostgreSQL:

```bash
docker exec -it postgres-payment psql -U postgres -d payment_system
```

Comandos úteis no psql:
```sql
-- Listar tabelas
\dt

-- Ver estrutura da tabela
\d "Customer"

-- Consultar clientes
SELECT * FROM "Customer";
```

## 🔧 Troubleshooting

### Porta 3000 já está em uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Prisma Client não encontrado

```bash
npx prisma generate
```

### Erro de conexão com PostgreSQL

```bash
# Verificar se o container está rodando
docker ps

# Reiniciar
docker-compose restart postgres

# Ver logs
docker-compose logs postgres
```

## 📝 Próximos Passos

- [ ] Implementar CRUD de Charges (pagamentos)
- [ ] Adicionar autenticação JWT
- [ ] Implementar testes unitários e integração
- [ ] Adicionar paginação na listagem
- [ ] Implementar filtros e busca
- [ ] Adicionar documentação Swagger

## 📄 Licença

ISC

