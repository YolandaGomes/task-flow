# FrontEndAngular — Task Manager

[![Angular](https://img.shields.io/badge/Angular-22-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular Material](https://img.shields.io/badge/Angular%20Material-757575?style=flat&logo=angular&logoColor=white)](https://material.angular.dev/)
[![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=flat&logo=sass&logoColor=white)](https://sass-lang.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)

Interface em Angular para o [Sistema de Controle de Tarefas](../README.md) (API em Go,
`backEndGo/`). Gerado com Angular CLI 22.1.3.

Assim como o backend, é um projeto de estudo — o código prioriza aprender Angular na
prática, não necessariamente a forma mais "correta" ou enxuta de fazer as coisas.

**Estado atual:** Kanban navegável (rotas `/tasks` e `/tasks/new`), com formulário de
criação e diálogo de visualização/edição de tarefa funcionando na UI. `TaskService`
(`HttpClient`) já integra o board (`GET /tasks`), a criação (`POST /tasks`), a edição
(`PUT /tasks/:taskId`) e a exclusão (`DELETE /tasks/:taskId`) de tarefa com o backend;
o `TaskBoard` é atualizado automaticamente após editar, excluir ou mover, sem novo `GET`
nem reload da página. Tarefas também podem ser movidas entre colunas por setas no card
ou por drag-and-drop (Angular CDK), e ações de criar/editar/excluir dão feedback visual
ao usuário por meio de snackbars.

---

## Stack

- Angular 22.1 (standalone components)
- Angular Router
- Angular Material + CDK (incluindo `MatDialog`, `MatSnackBar` e Drag & Drop)
- Reactive Forms
- Signals
- SCSS
- Vitest (testes unitários)

Convenções de código adotadas no projeto estão em [AGENTS.md](./AGENTS.md).

---

## Estrutura

```
app/
├── app.ts                  → raiz, monta Header + <router-outlet>
├── app.routes.ts            → rotas: /tasks, /tasks/new, redirect de / para /tasks
├── app.config.ts             → providers globais: provideRouter, provideHttpClient
├── models/
│   ├── task.ts                → interface Task (espelha model.Task do backend)
│   ├── task-status.ts          → type TaskStatus ('TODO' | 'IN_PROGRESS' | 'DONE')
│   ├── create-task.ts           → payload de criação (sem id/timestamps)
│   └── response.ts             → ApiResponse, retorno de PUT/DELETE
├── services/
│   └── task.service.ts          → TaskService (HttpClient): getTasks, getTaskById, createTask, updateTask, deleteTask
├── pages/
│   ├── task-board/          → página da rota /tasks, envolve o componente TaskBoard
│   └── new-task/             → página da rota /tasks/new, formulário de criação, chama TaskService.createTask
└── components/
    ├── header/             → topo da página
    ├── task-board/          → busca tasks via TaskService.getTasks(), monta as 3 colunas e o botão "Nova tarefa"
    ├── task-column/         → título + cor do cabeçalho + lista de task-cards filtrada por status; cdkDropList conectado às outras colunas
    ├── task-card/            → cartão de tarefa (mat-card, cdkDrag), abre o TaskDialog ao clicar; setas para mover entre colunas
    └── task-dialog/          → MatDialog com modo visualização e modo edição da tarefa
```

Árvore: `App → Header + <router-outlet> → TaskBoardPage → TaskBoard → TaskColumn (×3) → TaskCard → TaskDialog`

### O que já tem

- Roteamento com `provideRouter`: `/tasks` (board) e `/tasks/new` (formulário), `/` redireciona para `/tasks`
- `Task`/`TaskStatus`/`CreateTask`/`ApiResponse` em `models/` espelhando os tipos do backend
- `provideHttpClient()` registrado em `app.config.ts`
- `TaskService` com `HttpClient` cobrindo os 5 endpoints do backend (`GET /tasks`,
  `GET/PUT/DELETE /tasks/:taskId`, `POST /tasks`)
- `TaskBoard` busca as tasks reais via `TaskService.getTasks()` no `constructor` e
  guarda em um `signal<Task[]>`, passando para as 3 colunas
- `TaskColumn` filtra as tarefas por `status` com `computed()` e renderiza com `@for`
- `TaskCard` recebe a tarefa via `input.required<Task>()` e abre o `TaskDialog` (Angular
  Material) ao clicar; expõe `taskUpdated`/`taskDeleted` (`output()`) que repassa o
  resultado do diálogo para `TaskColumn` → `TaskBoard`
- `TaskDialog` mostra os dados da tarefa (modo visualização) e alterna para um formulário
  Reactive Forms (modo edição) ao clicar em "Editar":
  - "Salvar" chama `TaskService.updateTask()` (`PUT /tasks/:taskId`) e fecha o diálogo
    retornando a tarefa atualizada
  - "Excluir" chama `TaskService.deleteTask()` (`DELETE /tasks/:taskId`) e fecha o
    diálogo sinalizando a exclusão (`{ deleted: true, taskId }`)
  - Modo visualização: `status` é traduzido para rótulo em português via
    `getTaskStatusLabel()` (`utils/task-status-label.ts`), e as datas de criação/atualização
    são formatadas com `DatePipe` (`dd/MM/yyyy 'às' HH:mm`)
- Página `NewTask` (`/tasks/new`) com Reactive Forms (`title` obrigatório) para criar
  tarefa; `createTask()` chama `TaskService.createTask()` e navega de volta para
  `/tasks` quando a API confirma a criação
- `TaskBoard` atualiza seu `signal<Task[]>` (`update()`) a partir dos eventos
  `taskUpdated`/`taskDeleted`/`taskMoved` retransmitidos por `TaskColumn`, mantendo o
  Kanban sincronizado com o backend sem recarregar a página
- Mover tarefa entre colunas, de duas formas (ambas emitem `taskMoved`):
  - `TaskCard`: botões de seta (`moveForward`/`moveBackward`, `mat-icon-button`) avançam
    ou retrocedem a tarefa uma posição no fluxo `TODO → IN_PROGRESS → DONE`
  - `TaskColumn`: cada coluna é um `cdkDropList` conectado às outras duas
    (`cdkDropListConnectedTo`) e cada card é `cdkDrag`; soltar em outra coluna
    (`drop()`) monta a tarefa com o novo status — soltar na mesma coluna é ignorado
    (`event.previousContainer === event.container`)
  - `TaskBoard.moveTask()` chama `TaskService.updateTask()` e, na resposta, atualiza o
    `signal<Task[]>` (mesmo `updateTask()` usado após editar pelo `TaskDialog`)
- Feedback visual com `MatSnackBar`: `NewTask` (criar), `TaskDialog` (editar/excluir)
  mostram snackbar de sucesso ou erro para cada ação; `TaskBoard.moveTask()` ainda não
  tem esse feedback (erro só vai pro `console.error`)

---
## Atualização do Board após editar/excluir

A edição e a exclusão de uma tarefa utilizam o mesmo fluxo de comunicação entre
componentes do Angular:

TaskDialog
    ↓
TaskCard
    ↓
TaskColumn
    ↓
TaskBoard

Após o PUT ou o DELETE `/tasks/:id` ser confirmado pelo backend, o TaskDialog fecha
retornando a tarefa atualizada (edição) ou `{ deleted: true, taskId }` (exclusão). O
TaskCard interpreta o resultado e emite `taskUpdated` ou `taskDeleted` (output()), e o
TaskColumn retransmite o evento para o TaskBoard.

O TaskBoard então atualiza seu signal<Task[]> usando tasks.update():

// edição — substitui apenas a tarefa modificada
this.tasks.update(tasks =>
  tasks.map(task =>
    task.id === updatedTask.id
      ? updatedTask
      : task
  )
);

// exclusão — remove a tarefa da lista
this.tasks.update(tasks =>
  tasks.filter(task => task.id !== taskId)
);

Como o TaskColumn utiliza um computed() para filtrar as tarefas por status, a interface é atualizada automaticamente. Assim, se o status for alterado, a tarefa é movida imediatamente para a coluna correspondente, e uma tarefa excluída some do board, sem novo GET e sem recarregar a página.

Esse fluxo mantém o estado do Kanban sincronizado com a alteração realizada no backend.

## Mover tarefa (setas e drag-and-drop)

Mover uma tarefa não passa pelo TaskDialog — o evento `taskMoved` nasce direto no
TaskCard ou no TaskColumn e sobe até o TaskBoard:

TaskCard (setas) ─┐
                   ├─→ TaskColumn ─→ TaskBoard
TaskColumn (drop) ─┘

- Pelas setas: `moveForward()`/`moveBackward()` no `TaskCard` calculam o próximo/anterior
  status e emitem `taskMoved` diretamente.
- Por drag-and-drop: as 3 colunas são `cdkDropList`s conectadas entre si
  (`cdkDropListConnectedTo: ['todo', 'inProgress', 'done']`), e cada card dentro delas é
  `cdkDrag`. Ao soltar (`cdkDropListDropped`), `TaskColumn.drop()` monta a tarefa com o
  status da coluna de destino e emite `taskMoved`; soltar dentro da própria coluna não
  emite nada (é só reordenação visual).
- O `TaskBoard.moveTask()` recebe o evento, chama `TaskService.updateTask()`
  (`PUT /tasks/:taskId`) e atualiza o `signal<Task[]>` com a resposta — a tarefa salta de
  coluna imediatamente porque `TaskColumn.filteredTasks()` é um `computed()` sobre o
  status.

O drag-and-drop também tem feedback visual em CSS: sombra elevada no card sendo
arrastado (`.cdk-drag-preview`), um slot tracejado vazio indicando onde ele vai cair
(`.cdk-drag-placeholder`), destaque na coluna que está recebendo o card
(`.cdk-drop-list-dragging`) e cursor `grab`/`grabbing`.

### O que falta

- Excluir tarefa não pede confirmação — o clique em "Excluir" no `TaskDialog` já
  dispara `TaskService.deleteTask()` direto, sem um passo intermediário de confirmação
- `environment` com a URL base da API — hoje `TaskService` tem `http://localhost:8000/tasks` fixo no código


## Como rodar

Backend rodando (`cd backEndGo && docker compose up --build -d`), depois:

```bash
npm install
ng serve
```

Abre em `http://localhost:4200/`.

```bash
ng generate component nome-do-componente
ng build
ng test
```

---

## Próximos passos

- [x] Interface `Task`/`TaskStatus` espelhando `model.Task` do backend
- [x] `TaskColumn` renderizar cards com `@for` a partir de uma lista real
- [x] `input()` de `task` no `TaskCard`
- [x] Formulário de criar tarefa (página `/tasks/new`)
- [x] Formulário de editar tarefa (modo edição no `TaskDialog`)
- [x] `TaskService` com `HttpClient` consumindo `GET/POST /tasks`, `GET/PUT/DELETE /tasks/:taskId`
- [x] Ligar `createTask()` (NewTask) no `TaskService`
- [x] Ligar `saveTask()` (TaskDialog) no `TaskService.updateTask()`
- [x] Excluir tarefa pelo `TaskDialog` (`TaskService.deleteTask()`)
- [x] Atualizar o `TaskBoard` após editar/excluir uma tarefa
- [x] Mover tarefa entre colunas: setas no `TaskCard` e drag-and-drop com Angular CDK
- [x] Feedback visual (`MatSnackBar`) ao criar/editar/excluir tarefa
- [ ] Confirmação antes de excluir tarefa (hoje "Excluir" já executa direto)
- [ ] `environment` com a URL base da API
- [ ] Testes com dados mockados de `TaskService`

---

## Contexto de aprendizado

Primeiro contato da autora com Angular standalone components, signals e Angular Material.
Ver também o [README raiz](../README.md) para a visão geral do projeto, e o
[README do backend](../backEndGo/README.md) para o contexto da API em Go.
