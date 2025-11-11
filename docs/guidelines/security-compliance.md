# Security & Compliance

Security starts in development and continues through operations. Follow this checklist to protect user data and meet compliance requirements.

## Authentication & Authorization

- Use Spring Security with JWT/OAuth2 as configured by JHipster.
- Guard every REST endpoint with role-based annotations (`@PreAuthorize`, `hasAuthority`).
- Never trust client-side checks—enforce permissions server-side.
- Rotate secrets and keys regularly; store them in environment variables or a secret manager.

## Input Validation & Sanitization

- Validate all request payloads with Bean Validation. Reject requests with meaningful error keys.
- Sanitize strings to avoid injection attacks (e.g., replacing tabs/newlines in exports).
- Use parameterized queries and repository APIs instead of string concatenation.
- Encode output rendered in the UI to prevent XSS. React escapes by default; avoid `dangerouslySetInnerHTML`.

## Data Protection

- Encrypt sensitive data at rest when required (database-level encryption or field encryption service).
- Use HTTPS everywhere. Enforce TLS 1.2+.
- Redact secrets in logs, errors, and monitoring dashboards.
- Implement data retention policies and automate deletion for stale records if regulations demand it.

## Security Testing

- Static analysis: run SpotBugs, SonarQube, or GitHub Advanced Security.
- Dependency scanning: Dependabot/Snyk weekly. Patch critical vulnerabilities within 24 hours.
- Penetration testing: coordinate with security team every major release.
- Automated security tests: include login abuse, rate limiting, and input fuzzing where feasible.

## Compliance & Auditing

- Keep an audit trail for critical operations (create/update/delete of key entities).  
  Use the existing auditing fields (`createdBy`, `createdDate`, etc.) and extend them when needed.
- Document data flows and storage locations for GDPR compliance.  
  Provide mechanisms for data export and deletion upon user request.
- Maintain incident response playbooks and record post-incident reviews.

## Secure Coding Practices

- Run `npm audit` and `mvn dependency-check:aggregate` periodically.
- Use the latest LTS versions of runtime and frameworks.
- Keep secrets out of the repository (`.gitignore`, environment variables).
- Review third-party libraries before adoption. Prefer well-maintained packages with permissive licenses.

## Handling Incidents

- Classify incidents by severity and escalate according to the on-call rota.
- Communicate with stakeholders promptly with known impact and mitigation steps.
- After resolution, hold a blameless postmortem with action items tracked to completion.

Security is a shared responsibility. If you see something suspicious, raise it immediately—do not wait for scheduled reviews.

