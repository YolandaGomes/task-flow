# BackEndGo — Task Manager API

API REST em Go para o [Sistema de Controle de Tarefas](../README.md) (interface em
Angular, `frontEndAngular/`). Projeto de estudo para aprender a linguagem construindo
uma API completa seguindo o padrão de arquitetura em camadas
(**Controller → Service → Repository**). Baseado em um tutorial do YouTube que constrói
uma API de estoque de produtos, adaptado aqui para um sistema de gerenciamento de
tarefas.

---

## Stack utilizada

| Camada | Tecnologia |
|---|---|
| Linguagem | [Go](https://go.dev/) 1.25 |
| Framework HTTP | [Gin](https://gin-gonic.com/) |
| CORS | [gin-contrib/cors](https://github.com/gin-contrib/cors) |
| Banco de dados | PostgreSQL 17 |
| Driver do banco | [lib/pq](https://github.com/lib/pq) |
| Containerização | Docker + Docker Compose |

---

## Arquitetura

O projeto segue uma separação clássica em camadas, onde cada uma tem uma única
responsabilidade e só conhece a camada logo abaixo dela:

```
cmd/            → ponto de entrada da aplicação (main.go)
controller/     → recebe a requisição HTTP, valida entrada e devolve a resposta
service/        → regra de negócio (hoje é uma camada fina, repassa para o repository)
repository/     → única camada que conversa com o banco de dados (SQL puro)
model/          → structs que representam os dados (Task, Response)
db/             → abre e mantém a conexão com o PostgreSQL
```

### Fluxo de uma requisição

Usando o `POST /tasks` como exemplo:

1. **`cmd/main.go`** registra a rota e a associa ao método `CreateTask` do controller.
2. **`controller/taskController.go`** lê o JSON do corpo da requisição (`ctx.BindJSON`)
   e o transforma em uma struct `model.Task`.
3. O controller chama `taskService.CreateTask(task)` — ele não sabe *como* a tarefa
   é salva, só delega.
4. **`service/taskService.go`** aplica a regra de negócio (hoje, apenas repassa a
   chamada) e delega para o repository.
5. **`repository/taskRepository.go`** monta e executa o `INSERT` SQL, usando
   `sql.DB` para falar com o Postgres, e retorna o `id` gerado.
6. O controller recebe a tarefa criada e responde ao cliente com `201 Created`.

Essa é a ideia central do padrão: cada camada só depende da camada abaixo dela
(o `controller` depende do `service`, que depende do `repository`), o que facilita
testar e trocar peças isoladamente no futuro.

### Injeção de dependência manual (em `main.go`)

```go
dbConnection, _ := db.ConnectDB()
TaskRepository := repository.NewTaskRepository(dbConnection)
TaskService := service.NewTaskService(TaskRepository)
TaskController := controller.NewTaskController(TaskService)
```

Cada camada superior recebe, no seu construtor (`NewXxx`), uma instância da camada
inferior. É assim que o `controller` tem acesso ao `service` sem precisar saber
como ele foi montado.

### CORS

Ao ligar o frontend Angular (`http://localhost:4200`) na API (`http://localhost:8000`),
as requisições do `TaskService` (via `HttpClient`) eram bloqueadas pelo navegador com
erro de CORS — origens e portas diferentes contam como cross-origin, e a API não
enviava os headers `Access-Control-Allow-*` exigidos.

A correção foi registrar o middleware `cors.New` do `gin-contrib/cors` **antes** de
qualquer rota, em `cmd/main.go`:

```go
server.Use(cors.New(cors.Config{
    AllowOrigins: []string{"http://localhost:4200"},
    AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders: []string{"Origin", "Content-Type", "Accept"},
}))
```

> ⚠️ `AllowOrigins` está fixo em `http://localhost:4200` (origem do `ng serve`). Se a
> porta do frontend mudar ou a API for exposta em outro host, esse valor precisa ser
> atualizado (ou trocado por uma variável de ambiente).

### Credenciais do banco

`db/conn.go` lê usuário, senha e nome do banco de variáveis de ambiente
(`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) — nada fica hardcoded no código.
O `docker-compose.yml` repassa essas mesmas variáveis para os containers `postgres` e
`backend`, lendo de um arquivo `.env` local (veja `.env.exemple`). Host (`postgres`,
o nome do serviço no Compose) e porta (`5432`) são as únicas constantes fixas —
apropriado para a rede interna do Docker Compose, mas não portável fora dela.

---

## Modelo de dados

`model/task.go`:

```go
type Task struct {
    ID          int
    Title       string
    Description string
    Status      string
    CreatedAt   time.Time
    UpdatedAt   time.Time
}
```

> ⚠️ O projeto ainda não tem um script de migração/criação de tabela. Antes de
> rodar pela primeira vez, crie a tabela manualmente no Postgres:
>
> ```sql
> CREATE TABLE tasks (
>     id SERIAL PRIMARY KEY,
>     title VARCHAR(255) NOT NULL,
>     description TEXT,
>     status VARCHAR(20) NOT NULL DEFAULT 'TODO',
>     created_at TIMESTAMP DEFAULT NOW(),
>     updated_at TIMESTAMP DEFAULT NOW()
> );
> ```

---

## Endpoints disponíveis

| Método | Rota | Descrição |
|---|---|---|
| GET | `/ping` | healthcheck simples ("pong") |
| GET | `/tasks` | lista todas as tarefas |
| POST | `/tasks` | cria uma nova tarefa |
| GET | `/tasks/:taskId` | busca uma tarefa por id |
| PUT | `/tasks/:taskId` | atualiza uma tarefa existente |
| DELETE | `/tasks/:taskId` | remove uma tarefa |

Todas as rotas de erro retornam um `model.Response{ Message: string }` explicando
o problema (id nulo, id inválido, tarefa não encontrada, etc).

---

## Como rodar

Pré-requisitos: Docker e Docker Compose instalados (abra o Docker Desktop antes de
rodar o comando). Crie um `.env` nesta pasta a partir de `.env.exemple`, preenchendo
`POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`.

```bash
cd backEndGo
docker compose up --build -d
```

Isso sobe dois containers:

- `taskmanager-db` — Postgres 17, exposto na porta `5432`
- `taskmanager-api` — a API Go, exposta na porta `8000`

Teste com:

```bash
curl http://localhost:8000/ping
```

---

## Próximos passos (roadmap)

- [ ] Automatizar a criação da tabela `tasks` (script de init do Postgres ou lib de migration)
- [ ] Adicionar validações de entrada (ex: `title` obrigatório)
- [ ] Extrair interfaces para `TaskRepository` e `TaskService`, permitindo mocks em testes
- [ ] Escrever testes unitários para service e repository
- [ ] `AllowOrigins` do CORS hoje está fixo em `http://localhost:4200`; tornar configurável por variável de ambiente
- [x] Credenciais do banco via variáveis de ambiente (`.env` + Docker Compose), em vez de fixas no código

---

## Contexto de aprendizado

Este projeto é o primeiro contato da autora com Go. A arquitetura em camadas,
os construtores `NewXxx`, o uso do `database/sql` com `lib/pq` e o roteamento
com Gin foram todos aprendidos e aplicados aqui pela primeira vez.
