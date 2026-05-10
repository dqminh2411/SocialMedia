
# SocialMedia

![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)
![Spring%20Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)


A Instagram-style social media application where users can create and share posts, follow others, get personalized feeds, and engage in real-time conversations. It also includes an admin dashboard for platform management.

## Table of Contents

- [Quickstart](#quickstart)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Configuration](#configuration)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Troubleshooting](#troubleshooting)
- [Teamwork](#teamwork)

## Quickstart

### Prerequisites

- Docker Desktop (recommended)
- Optional for local dev: JDK 17, Node.js 18+

### 1) Clone

```bash
git clone https://github.com/dqminh2411/SocialMedia.git
cd SocialMedia
```

### 2) Configure environment

This project uses a root `.env` for Docker Compose + backend container environment variables.

```bash
copy .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Open `.env` and fill the required values (see [Configuration](#configuration)).

### 3A) Run everything with Docker (recommended)

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/v1
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- Actuator health: http://localhost:8080/actuator/health
- WebSocket: ws://localhost:8080/ws

Demo account:

Role: `USER`
- Email: `user8@gmail.com`
- Password: `12345678`

Role: `ADMIN`
- Email: `admin@gmail.com`
- Password: `12345678`

### 3B) Run locally (dev mode)

Option 1 (simplest): keep MySQL + Redis in Docker, run apps locally.

1) Start infra only:

```bash
docker compose up -d db redis
```

2) Start backend:

```bash
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell, use:

```bash
cd backend
./mvnw.cmd spring-boot:run
```

3) Start frontend:

```bash
cd frontend
npm install
npm run dev
```

Notes:

- Vite dev server defaults to http://localhost:5173.
- The frontend API base URL is configured in `frontend/src/services/api.js`.

## Architecture

High level:

- **Frontend** (React/Vite) calls REST APIs and connects to WebSocket STOMP.
- **Backend** (Spring Boot) exposes REST endpoints under a configurable API prefix (default `/api/v1`) and a WebSocket endpoint at `/ws`.
- **MySQL** persists relational data (users, posts, comments, chats, notifications, …).
- **Redis** stores short-lived feed snapshots and aggregates post views before batch persistence.

Project structure:

```text
backend/
  src/main/java/com/ttcs/socialmedia/
    controller/   # REST controllers + STOMP controller
    service/      # business logic (feed caching, async flush, chat, auth, ...)
    repository/   # Spring Data JPA repositories
    config/       # Security, JWT, WebSocket, Redis, OpenAPI, async executors
    util/         # response envelope, sanitization, exceptions
frontend/
  src/
    pages/        # home, explore, messages, notifications, profile, admin
    services/     # axios API client, auth, websocket client
docker-compose.yaml
```

## Tech Stack

Backend:

- Java 17, Spring Boot 3.4
- Spring Web, Validation
- Spring Security (OAuth2 Resource Server) + JWT
- Spring Data JPA (Hibernate) + MySQL
- Spring WebSocket (STOMP)
- Spring Data Redis
- springdoc OpenAPI + Swagger UI
- Actuator (health/metrics)

Frontend:

- React + React Router
- Axios (includes refresh-token retry logic)
- STOMP client for WebSocket messaging

Infrastructure:

- Docker Compose (MySQL, Redis, backend, frontend)

## Features

Backend-focused highlights (based on the current codebase):

- **Auth & security**: JWT access tokens + refresh token stored as an `HttpOnly` cookie; protected routes via Spring Security and method security.
- **Role-based access**: admin endpoints under `/api/v1/admin/**` gated by roles.
- **Real-time messaging**: WebSocket STOMP endpoint (`/ws`) with user-scoped destinations for chat and notifications.
- **Feed performance work**: Redis caches a snapshot of feed post IDs per user (stable pagination) and uses TTL for session-like feed refresh.
- **Async batching**: post-view events are aggregated in Redis and flushed to MySQL in batches on a scheduler using an async executor.
- **Media uploads**: post media/avatars uploaded via Cloudinary.
- **API usability**: Swagger UI for exploration; global response envelope + centralized exception handling.
- **Input safety**: server-side HTML sanitization for post content.

## Configuration

Use `.env.example` as the template and create a local `.env`.

The `.env` file is used for:

- Docker Compose variable substitution (ports, DB credentials, etc.)
- Passing environment variables into the backend container (via `env_file` in `docker-compose.yaml`)

### Required for Docker Compose

- `BE_PORT`: host port mapped to backend `8080`
- `FE_PORT`: host port mapped to frontend `3000`
- `DB_PORT`: host port mapped to MySQL `3306`
- `REDIS_PORT`: host port mapped to Redis `6379`
- `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_ROOT_PASS`: MySQL init credentials

### Required for backend connectivity (recommended)

When running the backend in Docker, configure Spring via env vars (Spring Boot reads `SPRING_...` variables automatically):

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_DATA_REDIS_HOST`
- `SPRING_DATA_REDIS_PORT`

### Common optional keys

- `API_PREFIX` (defaults to `/api/v1`)
- `CLOUDINARY_URL` (media uploads)
- `SPRING_MAIL_*` (SMTP)
- `APP_JWT_*` (JWT secret + token validity overrides)
- `APP_UPLOAD_FILE_BASE_URI` (local storage base URI if you serve `/storage/**` from disk)

Security note:

- Do not commit `.env`.

## Testing

Backend:

```bash
cd backend
./mvnw test
```

Frontend (lint):

```bash
cd frontend
npm run lint
```

## CI/CD Pipeline

This project uses GitHub Actions for Continuous Integration (CI).

### Automated Workflows

The CI pipeline automatically runs when code is pushed or pull requests are created.

#### Backend CI
- Build Spring Boot application
- Run Maven tests
- Build backend Docker image

#### Frontend CI
- Install dependencies
- Build React/Vite application
- Build frontend Docker image

#### Integration Testing
- Start full application stack using Docker Compose
- Launch:
  - MySQL
  - Redis
  - Spring Boot backend
  - React frontend
- Validate container startup and service integration

### Technologies Used
- GitHub Actions
- Docker
- Docker Compose
- Spring Boot
- React + Vite
- MySQL
- Redis

### Environment Configuration
Sensitive credentials are managed securely using:
- GitHub Actions Secrets
- GitHub Actions Environment Variables

### Workflow Structure

```text
.github/workflows/
├── backend-ci.yml
├── frontend-ci.yml
└── docker-compose-ci.yml
```

## Troubleshooting

- **Ports already in use**: change `BE_PORT`, `FE_PORT`, `DB_PORT`, `REDIS_PORT` in `.env`.
- **Backend can’t reach MySQL in Docker**: ensure `SPRING_DATASOURCE_URL` points to `db` (container DNS), e.g. `jdbc:mysql://db:3306/<DB_NAME>`.
- **Backend can’t reach Redis in Docker**: set `SPRING_DATA_REDIS_HOST=redis` and `SPRING_DATA_REDIS_PORT=6379`.
- **Refresh-token cookie not set in local HTTP**: the refresh token cookie is marked `Secure`; in some browsers this requires HTTPS.
- **WebSocket connect fails with “no Authorization header”**: ensure you are logged in and the client is sending `Authorization: Bearer <token>` in STOMP connect headers.
- **Frontend calls wrong backend URL**: update the Axios base URL in `frontend/src/services/api.js` if your backend port or host differs.

## Teamwork

| Member | Role |
| --- | --- |
| Đoàn Quang Minh | Team Lead, Requirements Analysis, System Design (Architecture, Database, API), Backend Implementation, Unit Testing, CI/CD pipeline |
| Nguyễn Đức Trung | Frontend Implementation, UI/UX Design, API Integration | 