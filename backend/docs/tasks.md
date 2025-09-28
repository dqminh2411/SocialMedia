# Improvement Tasks Checklist

Note: Each item is actionable and intended to be checked off upon completion. The list progresses from architecture and cross‑cutting concerns to module‑specific and code‑level improvements.

1. [ ] Establish engineering standards and project documentation
   - [ ] Add top-level README sections for architecture overview, local setup, build, test, run, and deployment
   - [ ] Create ADRs (Architecture Decision Records) folder and document key decisions (JWT auth, stateless sessions, media storage)
   - [ ] Enable and document OpenAPI/Swagger UI paths; ensure they’re accessible via security config in all profiles
   - [ ] Add CONTRIBUTING.md with code style, branching, and PR review guidelines

2. [ ] Introduce global error handling and uniform API response model
   - [ ] Add @ControllerAdvice for exception translation to consistent JSON error payloads (timestamp, path, code, message)
   - [ ] Replace ad-hoc RuntimeException throws with domain-specific exceptions (NotFound, BadRequest, Forbidden)
   - [ ] Ensure ResponseEntity usage is consistent and includes appropriate status codes
   - [ ] Document error codes and common failure cases in README

3. [ ] Security hardening and consistency
   - [ ] Centralize and document CORS policy; restrict origins by environment
   - [ ] Review and tighten whiteLists in SecurityConfiguration; ensure only intended endpoints are public
   - [ ] Add/verify method-level security annotations (@PreAuthorize) for mutating endpoints (create/update/delete)
   - [ ] Replace System.out prints with logging; ensure CustomAuthenticationEntryPoint returns structured errors
   - [ ] Externalize JWT secrets via environment and rotate in non-dev; validate token clock skew
   - [ ] Add security tests for authenticated/unauthenticated access and role-based access to admin endpoints

4. [ ] Validation and input constraints
   - [ ] Use javax/jakarta validation annotations on DTOs (e.g., @NotNull, @Size) and enable @Valid on controller params
   - [ ] Validate file uploads (size/type/length); configure max file size and request size
   - [ ] Normalize pagination parameters (pageNo >= 0, size bounds, defaults)

5. [ ] Transaction, repository, and persistence improvements
   - [ ] Add @Transactional boundaries for service methods that write multiple aggregates (create/update/delete flows)
   - [ ] Enforce unique constraints and indexes:
     - [ ] Follow: unique (following_user_id, followed_user_id), index by status
     - [ ] Like entities: unique (user_id, target_id)
     - [ ] Post, Comment: indexes for common queries (creator_id, post_id, created_at)
   - [ ] Migrate schema to Flyway or Liquibase and codify constraints/indexes
   - [ ] Replace custom findById returning null with Optional and handle absent cases explicitly

6. [ ] DTO mapping strategy
   - [ ] Create dedicated mapper classes or adopt MapStruct for User, Post, Comment, Follow, Profile conversions
   - [ ] Remove mapping logic from services where possible to keep services focused on orchestration
   - [ ] Ensure DTOs avoid lazy-loading traps; fetch joins where necessary

7. [ ] Consistent pagination and sorting
   - [ ] Standardize PageRequest creation and expose size parameter where appropriate with safe defaults
   - [ ] Return 1-based page numbers to clients where expected, but keep backend zero-based internally; document the convention
   - [ ] Ensure endpoints expose totalPages, totalElements, currentPage consistently

8. [ ] Follow domain improvements
   - [ ] Prevent duplicate follow records; make follow creation idempotent
   - [ ] Enforce follow state machine: PENDING -> CONFIRMED; add cancellation/reject path
   - [ ] Authorization checks: only followedUser can confirm/delete a follow request; followingUser can cancel own request
   - [ ] Expose My Follows endpoints that always use current authenticated user (avoid relying on client-sent IDs)
   - [ ] Return meaningful status codes (201 created, 204 no content, 409 conflict, 404 not found)

9. [ ] Post and media handling
   - [ ] Validate media mime types and size; limit max number of attachments per post
   - [ ] Ensure orphan media cleanup on post update/delete (including when exceptions occur)
   - [ ] Consider background processing for heavy media operations; add retries/backoff on remote storage errors
   - [ ] Add content validation for post text (max length, profanity filter hooks if needed)

10. [ ] Comment and like flows
   - [ ] Make like/unlike idempotent and return current state to caller
   - [ ] Add authorization guards for update/delete (only owner or moderator); reuse centralized ownership check
   - [ ] Optimize counts: avoid N+1 when listing comments/likes; consider caching hot counters
   - [ ] Add endpoint to fetch replies with consistent pagination and metadata

11. [ ] Profile module improvements
   - [ ] Validate bio length and avatar aspect ratio/size
   - [ ] Avoid leaking storage URLs if private; consider signed URLs or proxying where needed
   - [ ] Ensure profile lookups handle missing profiles gracefully with 404

12. [ ] Performance and scalability
   - [ ] Add query-level optimizations and fetch joins to reduce N+1 across Post detail and feeds
   - [ ] Introduce caching (e.g., Spring Cache) for frequently accessed counts and profile summaries
   - [ ] Add rate limiting for write-heavy endpoints (likes, follows) if applicable

13. [ ] Logging, metrics, and observability
   - [ ] Adopt SLF4J logging with structured context (userId, requestId)
   - [ ] Add HTTP request logging (safely) and correlation IDs
   - [ ] Expose Micrometer metrics and health probes; document /actuator usage by environment

14. [ ] Testing strategy
   - [ ] Unit tests for services with mocks; cover happy paths and edge cases
   - [ ] WebMvcTest for controllers including validation and error responses
   - [ ] Security integration tests for authorization rules and JWT parsing
   - [ ] Repository tests for custom queries and pagination
   - [ ] Test data builders and utilities to simplify fixtures

15. [ ] Configuration and environment management
   - [ ] Externalize magic values to application-*.properties; use profiles (dev, test, prod)
   - [ ] Ensure secrets and keys are sourced from environment variables or secret manager
   - [ ] Provide sample .env or application-local.properties.example

16. [ ] Code quality and style
   - [ ] Introduce Spotless/Checkstyle for formatting and basic rules; enforce in CI
   - [ ] Replace field lookups by email/id with cohesive methods in UserService; avoid duplicated repository access across services
   - [ ] Remove dead/commented code and TODOs; add TODO tracker in issues if needed

17. [ ] API design consistency
   - [ ] Adopt consistent base path and versioning (/api/v1)
   - [ ] Use consistent nouns and HTTP semantics; ensure DELETE returns 204 on success without body
   - [ ] Standardize response envelope for list endpoints and detail endpoints

18. [ ] CI/CD and build pipeline
   - [ ] Add GitHub Actions (or equivalent) to run build, test, static analysis on PRs
   - [ ] Fail builds on style violations and test failures
   - [ ] Publish test and coverage reports as artifacts; track coverage threshold

19. [ ] Documentation for developers and operators
   - [ ] Sequence diagrams for auth, post create/update, follow confirm flows
   - [ ] On-call runbook: common errors, log messages, and remediation steps
   - [ ] Performance playbook: how to profile and analyze slow queries

20. [ ] Database lifecycle and data hygiene
   - [ ] Seed scripts for dev/test data; anonymization for realistic datasets
   - [ ] Scheduled tasks to clean up stale PENDING follows or soft-deleted content if applicable
   - [ ] Backfill and migration plan for existing data to new constraints/indexes
