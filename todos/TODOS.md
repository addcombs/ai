# API TODOs
Suggested improvements for `admin-service-api`.

## Most valuable
- [ ] **Database migrations:** The schema is applied by hand from `db/migrations`, and `ddl-auto=validate` only checks it. Add Flyway so migrations run automatically on startup.
- [ ] **Move secrets out of the run configuration:** The database password and Cognito values are stored in plain text in `.idea/runConfigurations/admin_service_api.xml`. Load them from an untracked `.env` file or AWS Secrets Manager, then rotate the Neon password.

## Nice to have
- [ ] **Connection pool tuning:** Neon's pooled connections can drop idle sessions. Set HikariCP `max-lifetime` and `connection-timeout` to avoid stale-connection errors.
- [ ] **Consistent error responses:** Set `spring.mvc.problemdetails.enabled=true` so validation and other framework errors return `ProblemDetail`, the same format `ApiExceptionHandler` already uses.
- [ ] **Integration tests:** Add Testcontainers PostgreSQL tests to check the JPA mappings and unique indexes (`cognito_sub`, `lower(email)`) against a real database.

## Worth checking
- [ ] **CORS:** The dev proxy handles it today. A deployed frontend on another origin needs explicit CORS settings.
