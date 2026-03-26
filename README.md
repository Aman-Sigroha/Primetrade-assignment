# PrimeTrade internship — Task API

Full-stack demo: **versioned REST API** (`/api/v1`) with **JWT authentication**, **role-based access** (user vs admin), **MongoDB** persistence, **Zod** validation, and a minimal **Next.js + Tailwind** UI. OpenAPI is served under **Swagger UI** at `/api-docs`.

## Tech stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- MongoDB + Mongoose
- `jsonwebtoken`, `bcryptjs`, `zod`, `axios`
- Swagger UI + `public/openapi.yaml`
- Vitest + `mongodb-memory-server` for API and validator tests

## Features

- **Auth:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login` — passwords hashed with bcrypt (cost 12); JWT access tokens (1 day), signed with `JWT_SECRET` (minimum 32 characters).
- **Tasks CRUD:** `POST/GET /api/v1/tasks`, `GET/PUT/DELETE /api/v1/tasks/:id` — bearer token required.
- **RBAC:** Regular users only see and mutate their own tasks. Admins can list all tasks (optional `?userId=` filter) and act on any task.
- **Consistency:** Responses use `{ success, message, data?, error? }` with appropriate HTTP status codes.
- **Security middleware:** Baseline headers (`X-Content-Type-Options`, `Referrer-Policy`, etc.) on navigations.

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local or Atlas), or use the URI from your provider

## Setup

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Set `MONGODB_URI` and a strong `JWT_SECRET` (32+ characters). For same-origin API calls you can leave `NEXT_PUBLIC_API_BASE` empty.

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) for the landing page, register/login, dashboard, and API docs.

## Evaluate in 2 minutes

1. Start app:

   ```bash
   npm install
   npm run dev
   ```

2. Open [http://localhost:3000/register](http://localhost:3000/register), create a user, then log in.
3. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) and:
   - create a task
   - refresh and confirm it persists
   - delete the task
4. Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs) and test endpoints.
5. (Optional) run automated checks:

   ```bash
   npm run lint
   npm run test:run
   npm run build
   ```

## Scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `npm run dev`  | Development server             |
| `npm run build`| Production build               |
| `npm run start`| Start production server        |
| `npm run lint` | ESLint                         |
| `npm run test` | Vitest (watch mode)            |
| `npm run test:run` | Vitest once (CI)           |

## API overview

| Method | Path                     | Auth   | Notes                                      |
| ------ | ------------------------ | ------ | ------------------------------------------ |
| POST   | `/api/v1/auth/register`  | —      | Body: `name`, `email`, `password`          |
| POST   | `/api/v1/auth/login`     | —      | Body: `email`, `password`                  |
| POST   | `/api/v1/tasks`          | Bearer | Create task                                |
| GET    | `/api/v1/tasks`          | Bearer | User: own tasks; admin: all (`?userId=` ok)|
| GET    | `/api/v1/tasks/:id`      | Bearer | Owner or admin                             |
| PUT    | `/api/v1/tasks/:id`      | Bearer | Owner or admin                             |
| DELETE | `/api/v1/tasks/:id`      | Bearer | Owner or admin                             |

Full detail: **Swagger UI** at `/api-docs` (spec: `/openapi.yaml`).

Postman collection: `docs/Primetrade.postman_collection.json`

**Authorization header:** `Authorization: Bearer <token>`

## Testing

Integration tests spin up an **in-memory MongoDB**; no local Mongo install required for `npm run test:run`.

```bash
npm run test:run
```

Coverage includes validators, JWT utilities, auth flows (including duplicate email), task ownership, admin list behavior, and invalid id handling.

## Scalability and next steps

- **Modular layout:** `lib/`, `models/`, `validators/`, and `app/api/v1/*` keep feature slices easy to extend (e.g. new `/api/v1/projects` modules).
- **Database:** Compound indexes on tasks (`userId`, `createdAt`) support owner-scoped lists at scale; add read replicas or sharding as data grows.
- **Auth:** Tokens are stateless JWTs; for revocation and rotation, introduce a token allowlist or refresh-token store (Redis).
- **Performance:** Add Redis caching for hot reads, horizontal scaling behind a load balancer, and strict rate limiting on auth routes.
- **Ops:** Structured logging, metrics, and container images (Docker) improve deployability and observability in production.

## License

Private / assignment use unless stated otherwise.
