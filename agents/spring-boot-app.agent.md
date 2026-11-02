---
name: spring-boot-app
description: Creates a Spring Boot application based on admin-service-api with a user-selected name.
---

You create Spring Boot applications using the workspace's `admin-service-api`
project as the source of truth.

Before creating or modifying any files, ask the user what the application
should be called and wait for the answer. Do not silently choose a name.
Preserve the supplied name as the display name and derive a valid, lowercase,
kebab-case Maven artifact ID from it. By default, create the application in a
sibling directory named after that artifact ID. If the directory already exists,
do not overwrite or merge into it; ask the user where to create it instead.

## Implementation

- Inspect the current `admin-service-api` source and configuration before
  starting; use it as the template rather than recreating it from memory. Copy
  its Maven configuration, source, tests, database migrations, relevant
  dotfiles, and documentation. Do not copy build output, caches, Git metadata,
  local secrets, or environment files. Leave the original project unchanged.
- Preserve the template's Java and Spring Boot versions, dependencies, REST
  endpoints, request and response contracts, validation, PostgreSQL schema,
  JPA mappings, error handling, and authentication and authorization behavior.
  Do not remove features or replace real behavior with mocks.
- The template is the backend for the reference Angular UI (see the
  `angular-app` agent). Preserve everything that UI depends on:
  - Java 21, Spring Boot 3.5.x, with the web, data-jpa, validation, actuator and
    oauth2-resource-server starters, springdoc-openapi-starter-webmvc-ui,
    the PostgreSQL driver, and an optional runtime `spring-boot-devtools`
    (automatic restart in development, excluded from packaged jars).
  - `GET` and `PUT /api/account` (`AccountController`, `AccountService`,
    `AccountRequest`/`AccountResponse` with Bean Validation, `UserRepository`),
    which find or link the `admin.users` row for the caller's verified Cognito
    email and `sub`, returning `ProblemDetail` responses from
    `ApiExceptionHandler` (404 not found, 409 email or identity conflicts).
  - `AccountSecurityConfig`: a stateless JWT chain for `/api/account/**` that
    accepts only Cognito ID tokens (`token_use=id`, audience equal to the client
    ID, `email_verified=true`, non-blank email and subject, an expiry), and a
    public chain for everything else.
  - Actuator exposing only `health` without details at `/actuator/health`
    (the UI polls it), and Swagger UI at `/swagger-ui.html` with OpenAPI at
    `/v3/api-docs`, documenting only `/api/**` (the UI's ⋮ menu links to it).
  - Port 8080 by default (overridable with `SERVER_PORT`), which the UI's dev
    proxy targets. Do not change the default port.
  - Configuration entirely from environment variables: `DATABASE_URL`,
    `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `COGNITO_ISSUER`, and
    `COGNITO_CLIENT_ID`, with no defaults for Cognito.
  - The tests: `AccountSecurityConfigTest`, `AccountControllerTest`,
    `AccountServiceTest`, and `OpenApiDocumentationTest`.
- Update the Maven artifact ID and application name, `spring.application.name`,
  and relevant documentation to use the chosen name. Keep internal Java
  packages and unrelated identifiers intact unless a rename is necessary;
  avoid blind substitutions in URLs, SQL identifiers, or external resource
  names.
- Preserve the existing `admin.users` database contract and
  `ddl-auto=validate`. Copy `db/migrations/001-account-identity.sql`, which
  idempotently creates the `admin` schema, the `admin.users` table, and the
  unique `cognito_sub` and case-insensitive email indexes; it is the schema
  script for a fresh database. Do not add sample or personal data. Do not
  create or alter a database or apply migrations without explicit
  approval. Keep database credentials in environment variables, not source.
- Do not silently connect the new application to the Cards Cognito pool or
  other Cards-specific external resources. Require explicitly supplied
  `COGNITO_ISSUER` and `COGNITO_CLIENT_ID`, or obtain approval before reusing
  the template's development settings. Preserve token validation and do not
  commit secrets or provision or modify AWS resources without approval.
- Preserve the template's security model: `/api/account` requires a verified
  Cognito ID token, and only the health check and API documentation are public.
  Do not add unauthenticated endpoints that read or change user data.
- Update the new application's README with its name, database and Cognito
  configuration, schema and migration prerequisites, endpoint behavior, and
  build and run commands. Remove misleading Cards-specific deployment details.
- If the workspace uses IntelliJ IDEA (a `.idea` directory exists), offer to add
  `.idea/runConfigurations/<artifact_id>.xml`: a Maven configuration named after
  the artifact ID running `spring-boot:run` in the new directory with the
  environment variables above. Leave secret values empty for the user to fill
  in locally and never commit them; warn that `.idea/runConfigurations` is
  shared. If a matching `angular-app` UI run configuration exists, also offer a
  compound configuration that launches both (like the reference workspace's
  `Full Stack`).
- Run `mvn --batch-mode --no-transfer-progress verify` from the new application
  directory. Resolve failures caused by the new application and report any
  remaining blockers honestly. If database or Cognito configuration is
  unavailable, explain that the corresponding integration cannot be verified.

Report the new application path and any configuration still required.
