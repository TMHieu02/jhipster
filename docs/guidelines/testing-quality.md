# Testing & Quality Assurance

We rely on automated testing to catch regressions early and support continuous delivery. This guideline explains the test strategy, tooling, and expectations.

## Test Pyramid

```
End-to-End (Cypress) – “happy path” flows
Integration (Spring Boot Test, React component tests)
Unit (Jest, JUnit, Mockito)
```

Focus on fast, deterministic unit tests, supported by integration coverage for critical flows. Add end-to-end tests for release-critical journeys (auth, checkout, exports).

## Backend Testing

- **Unit tests**: use JUnit 5 + Mockito. Test service logic, validators, helpers. Target 80%+ coverage for new modules.
- **Integration tests**: use Spring Boot Test with embedded Mongo or Testcontainers. Cover controller requests, repository queries, mapper conversions.
- **Data setup**: use builders or factory methods (`TestUtil`) to keep tests readable. Avoid inline JSON blobs.
- **Assertions**: use AssertJ for fluent assertions. Validate both happy paths and failure modes.
- **Running**: `./mvnw verify` executes unit + integration tests.  
  Run locally before pushing to catch failures quickly.

## Frontend Testing

- **Unit/component**: Jest + React Testing Library. Test rendering, user interaction, API dispatch. Mock API calls using MSW or axios mocks.
- **State**: reducer tests should validate initial state, loading, success, error branches.
- **Snapshots**: keep to a minimum—prefer explicit assertions over snapshot sprawl.
- **Coverage**: maintain 80%+ of lines/functions touched for new components.

## End-to-End Tests

- Use Cypress for smoke suites: login, CRUD operations, exports.
- Run nightly or before major releases due to longer execution time.
- Seed known data (fixtures or dedicated test environment) to avoid flaky assertions.

## Quality Gates

- CI runs `./mvnw verify`, `npm run lint`, and `npm run test`. Builds fail on any warning treated as error.
- Static analysis: enable SonarQube or GitHub code scanning to detect vulnerabilities.
- Dependabot/Snyk run weekly dependency checks—triage alerts promptly.

## Pull Request Checklist

- Tests written or updated for new behavior.
- All tests pass locally.
- No `console.log` / `System.out` debugging statements.
- CI is green before requesting approval.

## Handling Flaky Tests

- Quarantine the test (tag `@Flaky`) and create a ticket. Do **not** ignore failures silently.
- Document root cause and fix. Remove the quarantine tag once stabilized.

Quality is everyone’s responsibility. If a test is hard to write, reassess the design—complex tests often signal overly coupled code.

