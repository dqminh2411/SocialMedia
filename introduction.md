
# SocialMedia — Full‑Stack Social Platform (Java / Spring Boot)

A Instagram-style social media application where users can create and share posts, follow others, get personalized feeds, and engage in real-time conversations.

This repository contains:

- `backend/`: Spring Boot 3 (Java 17) REST API + WebSocket server
- `frontend/`: React (Vite) client
- `docker-compose.yaml`: local containers for MySQL + app services

## Why This Project Is Recruiter‑Relevant (Backend Highlights)

- **Modern Spring Security** (Spring Boot 3.4): OAuth2 Resource Server + JWT decoding/encoding, method security, and role-based protection for admin APIs.
- **Refresh-token session model**: access token in response body + refresh token in an `HttpOnly` cookie (refresh endpoint issues new access token).
- **Real-time features**: WebSocket endpoint (`/ws`) with STOMP, user-scoped messaging (`/user/...`) for chat + notifications.
- **Feed scalability work**: Redis stores a snapshot of feed post IDs per user (stable pagination + reduced DB reads). Post views are written to Redis and **flushed asynchronously in batches** to MySQL on a scheduler.
- **Clean API ergonomics**: global response envelope + centralized exception handling.
- **Operational readiness**: Actuator endpoints for health/metrics + OpenAPI/Swagger UI for documentation.

## Core Features

### Authentication & Security

- Email/password sign up + login
- JWT-based authorization for protected APIs
- Refresh access token via `/api/v1/auth/refresh`
- Google OAuth login flow (backend generates login URL and handles callback)

### Posts

- Create/update posts with **multipart form-data** (JSON payload + media list)
- Likes/unlikes, post detail view
- Comments + replies + comment likes
- Feed + explore + hashtag browsing
- Post view tracking (stored in Redis; batch persisted)

### Social Graph

- Follow requests + accept/reject
- Followers/following lists with pagination/search
- User suggestions

### Real-time

- Direct chat via WebSocket (STOMP)
- Notification delivery infrastructure (WebSocket + REST)

### Admin

- Dashboard statistics (users/posts/comments/chats/likes/hashtags)
- User management + post moderation endpoints
- Role/permission management endpoints

## Tech Stack

**Backend**

- Java 17, Spring Boot 3.4
- Spring Web, Spring Validation
- Spring Security (OAuth2 Resource Server) + JWT
- Spring Data JPA (Hibernate) + MySQL 8
- Spring WebSocket (STOMP)
- Redis (Spring Data Redis)
- OpenAPI/Swagger (springdoc)
- Cloudinary for media uploads
- Spring Mail (SMTP) for email dispatch
- Actuator (`/actuator/health`, `/actuator/metrics`)

**Frontend**

- React (Vite), React Router
- Axios (with refresh-token retry interceptor)
- STOMP client for WebSocket messaging

## Quick Links (Local)

- Frontend (Docker): http://localhost:3000
- Frontend (dev server): http://localhost:5173
- Backend API: http://localhost:8080/api/v1
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- Actuator health: http://localhost:8080/actuator/health
- WebSocket endpoint: ws://localhost:8080/ws

## API Conventions

- API prefix is configurable and defaults to: `/api/v1`.
- Most JSON responses are wrapped in a common envelope (`data`, `message`) via a global response advice.
- Admin APIs are under `/api/v1/admin/**` and are protected by role-based authorization.

For the full endpoint list, use Swagger UI.

## Running Locally

### Option A — Docker Compose (Recommended to demo quickly)

Prerequisites:

- Docker Desktop

This repo already includes a root `.env` used by `docker-compose.yaml`.

Start the stack:

```bash
docker compose up --build
```

Then open:

- http://localhost:3000

Notes:

- MySQL is mapped to `localhost:3307` by default (see `.env`).
- The backend supports Redis for feed/view features. If you want those features fully enabled in containers, run Redis and point Spring to it (see “Redis” below).

### Option B — Run Backend + Frontend in dev mode

Prerequisites:

- JDK 17
- Node.js 18+
- MySQL 8
- Redis (recommended)

#### 1) Backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell, use:

```bash
cd backend
./mvnw.cmd spring-boot:run
```

By default, the backend reads database settings from `backend/src/main/resources/application.properties`.
You can override them with environment variables (useful for local vs Docker):

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

#### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite’s dev server defaults to port `5173`.

The frontend API base URL is configured as `http://localhost:8080/api/v1`.

## Redis

Redis is used for:

- Feed snapshot caching (`feed:user:{id}`)
- Post view aggregation (`postView:user:{id}`) + scheduled async flush to MySQL

To run Redis quickly:

```bash
docker run --name social-redis -p 6379:6379 redis:7-alpine
```

Then configure Spring.

Example env vars when running the backend **locally**:

- `SPRING_DATA_REDIS_HOST=localhost`
- `SPRING_DATA_REDIS_PORT=6379`

If you run the backend **in Docker**, `localhost` points to the container itself. In that case:

- either add a Redis service to `docker-compose.yaml` and set `SPRING_DATA_REDIS_HOST=redis`, or
- point to a host-run Redis using `SPRING_DATA_REDIS_HOST=host.docker.internal` (Docker Desktop)

## WebSocket (Chat/Notifications)

- STOMP endpoint: `/ws`
- Application prefix: `/app`
- User destination prefix: `/user`

Frontend subscribes to:

- `/user/chat` for direct chat messages
- `/user/noti` for user notifications

## Testing

Backend tests:

```bash
cd backend
./mvnw test
```

## Project Structure

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
```

## Notes on Configuration (Security)

This repository includes local development configuration for OAuth, SMTP, and JWT. For a real deployment:

- move secrets to environment variables / secret manager
- rotate any exposed credentials


## Teamwork

| Member | Role |
| --- | --- |
| Đoàn Quang Minh | Team Lead, Requirements Analysis, System Design (Architecture, Database, API), Backend Implementation, Unit Testing |
| Nguyễn Đức Trung | Frontend Implementation, UI/UX Design, API Integration | 