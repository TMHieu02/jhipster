# API Design

We expose a RESTful API consumed by the SPA and external integrations. Follow these rules to keep endpoints consistent.

## Resource Modeling

- Base path: `/api`.
- Use plural nouns (`/api/products`, `/api/orders`).
- Nested resources express relationships (`/api/orders/customer/{customerId}`).
- Prefer UUID/string IDs to keep compatibility with MongoDB.

## HTTP Verbs

| Verb | Usage |
| --- | --- |
| `GET /api/products` | List with pagination |
| `GET /api/products/{id}` | Retrieve single item |
| `POST /api/products` | Create new entity |
| `PUT /api/products/{id}` | Replace entire entity |
| `PATCH /api/products/{id}` | Partial update using JSON Merge Patch |
| `DELETE /api/products/{id}` | Delete entity |

Bulk operations (exports, multi-delete) live under descriptive sub-paths (`/api/products/export`, `/api/products/bulk`).

## Request & Response Rules

- Accept and return JSON (`application/json`). For file exports, set the appropriate content type and `Content-Disposition`.
- Support pagination with `?page`, `?size`, `?sort` query parameters. Always return `X-Total-Count` header and pagination links (via `PaginationUtil`).
- Validate request bodies with Bean Validation, returning `400` with field errors.  
  Always include a message key (`error.validation`) and a list of invalid fields.
- For `POST`, return `201 Created` with `Location` header. For `DELETE`, return `204 No Content`.

## Error Handling

- Throw `BadRequestAlertException` for client errors.  
  The message should include an error key, entity name, and error code.
- Global errors are translated by `ExceptionTranslator` into a consistent JSON payload:

```json
{
  "type": "https://www.jhipster.tech/problem/problem-with-message",
  "title": "Bad Request",
  "status": 400,
  "detail": "A new product cannot already have an ID",
  "path": "/api/products",
  "message": "error.idexists"
}
```

- Authentication failures return `401`. Authorization issues return `403`.

## Versioning

- Backward compatible changes (new fields, optional params) do not require versioning.
- Breaking changes must introduce a new URL prefix (`/api/v2/products`) or accept header (`application/vnd.demo.v2+json`). Document deprecation timelines.

## Documentation

- Keep OpenAPI annotations in controllers for non-trivial endpoints.
- Generate and publish Swagger UI as part of the build.  
  Each controller should include sample responses and parameter descriptions where clarity is needed.
- Update API changelog in release notes and communicate to front-end team before merging.

## Performance & Security

- Limit payload size by filtering fields or using projections for list endpoints.
- Support conditional requests with ETags for expensive resources when feasible.
- Ensure all endpoints require authentication unless explicitly marked public.
- Enforce rate limiting or throttling at the gateway level for sensitive endpoints.

Keep this guideline updated when new integration requirements appear (webhooks, GraphQL, etc.).

