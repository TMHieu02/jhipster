# Coding Standards

Our goal is to make the codebase easy to read, review, and extend. Follow the rules below for every language we use.

## Java

- **Formatting**: run `./mvnw spotless:apply` before pushing. Do not hand-format code that the formatter will overwrite.
- **Structure**: keep Spring components thin—controllers call services, services coordinate repositories, repositories talk to the database.
- **Naming**:
  - Classes use PascalCase nouns (`OrderController`, `ProductService`).
  - Methods start with verbs (`save`, `findActive`, `exportToXlsx`).
  - Constants are `UPPER_SNAKE_CASE`.
  - Domain IDs stay as `String` unless there is a strong reason to use another type.
- **Logging**: use SLF4J placeholders (`log.debug("Saving product {}", productId);`) and never log secrets or tokens.
- **Null handling**: prefer `Optional` in service and repository APIs. Validate inputs using Bean Validation annotations (`@NotNull`, `@Size`, `@Email`) on DTOs and method parameters.
- **Exceptions**: throw meaningful exceptions (e.g., `BadRequestAlertException`) with clear messages. Wrap external system failures so the caller receives a 4xx/5xx with context.

## TypeScript / React

- **Formatting**: run `npm run lint -- --fix` and `npm run format` before opening a PR.
- **Components**: use functional components with hooks. Keep smart/connected components under `entities/<feature>` and reusable presentational components under `shared`.
- **State**: Redux slices belong in `entities/<feature>/<feature>.reducer.ts`. Avoid keeping derived data in the store—compute it with selectors.
- **Typing**: no `any`. Define shared interfaces under `shared/model`. Optional values use `type | undefined` instead of `null` unless interoperability requires it.
- **Imports**: order imports as [React, third-party, internal]. Use absolute paths starting at `app/` for internal modules.
- **Styling**: use SCSS modules and keep entity-specific styles next to the component. Shared variables live in `_bootstrap-variables.scss`.

## Shared Practices

- **Comments**: explain “why”, not “what”. Prefer descriptive names over comments when possible.
- **TODOs**: only commit TODOs when there is a linked ticket (`TODO(jira-123): refine validation`). Remove stale TODOs during cleanup.
- **Internationalization**: never hard-code user-facing strings—use translation keys.
- **Accessibility**: ensure forms have labels, interactive elements are keyboard accessible, and ARIA attributes are set when necessary.

## Tooling Checklist Before Commit

1. `npm run lint` (frontend)
2. `npm run test` (frontend unit tests when scope touches UI)
3. `./mvnw verify` (backend + integration tests)
4. `./mvnw spotless:apply` (Java formatting) / `npm run format`

Document any deliberate deviations in your PR description and add a follow-up ticket.

