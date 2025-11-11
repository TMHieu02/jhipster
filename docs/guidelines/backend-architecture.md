# Backend Architecture

We follow a layered Spring Boot architecture to keep responsibilities clear and testable.

## Layer Overview

```
Controller (REST) → Service (Business logic) → Repository (Persistence) → MongoDB
```

- **Controller** (`web.rest.controller`): Request validation, pagination, HTTP semantics. No business rules.
- **Service** (`service`): Business workflows, transaction boundaries, aggregation across repositories.
- **Repository** (`repository`, `repository.custom`): Data access with Spring Data interfaces and custom implementations.
- **Domain** (`domain`): Entities and aggregates. Keep them persistence-agnostic except for mapping annotations.

## Service Guidelines

- Annotate write operations with `@Transactional`. Use `readOnly = true` for pure queries.
- Compose smaller operations—avoid deeply nested service calls; it hides logic.
- Accept and return DTOs. Convert to domain entities inside the service using mappers.
- Handle business exceptions close to where they occur. Translate them to REST errors by throwing `BadRequestAlertException` or custom exceptions handled by `ExceptionTranslator`.

## Repository Guidelines

- Use Spring Data method names for simple queries (`findByActiveTrue`).  
  For complex queries, implement a `RepositoryCustom` interface and provide a class that ends with `Impl`.
- Prefer projections/DTOs when returning partial data sets to reduce payload size.
- Use pagination (`Pageable`) for any query that can grow.  
  For aggregation or export, stream results and close the cursor to avoid memory pressure.

## DTO & Mapper Strategy

- Place DTOs in `service.dto` and MapStruct mappers in `service.mapper`.
- DTOs expose only fields required by the client.  
  Keep domain-only fields (audit data, secrets) out of the DTO layer.
- Use MapStruct annotations to keep mapping logic declarative. Where manual mapping is required, isolate it in helper methods.

## Validation

- Bean Validation constraints live on DTOs.  
  Use `@Valid` in controller methods to trigger validation automatically.
- Services perform cross-field validation (business invariants). Throw `BadRequestAlertException` with clear keys (`"product.quantity.invalid"`).

## Configuration & Profiles

- Create environment-specific config under `src/main/resources/config`.  
  Use `application-dev.yml`, `application-prod.yml`, etc.
- Inject configuration via `@Value` or configuration properties classes (`@ConfigurationProperties`).
- Never hard-code secrets—load from env variables or Vault integration.

## Performance Considerations

- Cache frequently read data using Spring Cache and Redis/Memcached when available.
- Limit database round-trips using eager fetch only when necessary. Prefer projection queries.
- For bulk writes or exports, use batch operations and offload to async jobs via `@Async` or messaging.

## Observability

- Expose metrics through Micrometer. Add custom timers/counters for critical flows.
- Ensure every controller logs entry/exit at DEBUG and errors at WARN/ERROR with request IDs.
- Integrate with log correlation (Zipkin/Jaeger) by propagating tracing headers in outbound calls.

Document new patterns in this guideline when we introduce them to keep the architecture consistent.

