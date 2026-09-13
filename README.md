# Mira Task Manager

A standalone React application containing only Mira's task-management experience. The existing backend, Mira frontend, expense manager, food manager, and habit manager are not modified by this project.

## Existing backend contract

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `PUT /api/tasks/:id/completion`
- `DELETE /api/tasks/:id`

Task writes use the backend's existing fields: `title`, `notes`, `taskList`, `priority`, `dueOn`, `focusOn`, `urgent`, and `important`.

## Authentication integration

Authentication UI and Firebase are intentionally omitted. Register a token provider later without changing the task API modules:

```js
import { configureAccessTokenProvider } from "./api/client";

configureAccessTokenProvider(async () => yourAuthSession.getAccessToken());
```

Without a provider, requests are sent without an `Authorization` header.

## Later setup

Install the declared packages only when you are ready to run the project. No dependency installation, build, preview, application execution, deployment, or test execution was performed while this source was created.

