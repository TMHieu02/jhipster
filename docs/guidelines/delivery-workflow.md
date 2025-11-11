# Delivery Workflow

This guideline covers how we plan work, collaborate in Git, review code, and ship releases.

## Branching Strategy

- Default branch: `main`. Releases are tagged from `main`.
- Feature branches: `feature/<short-description>` (e.g., `feature/product-export`).
- Bug fixes: `bugfix/<ticket-id>`.
- Hotfixes: branch from the latest release tag (`hotfix/<issue>`), merge back into `main`, then tag a patch release.

## Commit & PR Standards

- Commit messages follow Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`).
- Keep commits focused. Squash unrelated changes.
- Pull Requests must include:
  - Summary of changes and motivation.
  - Checklist confirming tests/lints run.
  - Screenshots or API examples when applicable.
  - References to tickets (e.g., `Closes JIRA-123`).

## Code Review

- At least one reviewer for every PR. Request domain experts when touching shared modules.
- Reviewers check: correctness, security, performance, testing, documentation.
- Use GitHub review statuses: `Comment` (discussion), `Request changes` (blocking issues), `Approve` (ready to merge).
- Keep review cycles short (aim for <24 hours). Communicate if you need more time.

## Continuous Integration

CI pipeline stages:

1. **Install** – restore caches, install dependencies.
2. **Lint & Format** – `npm run lint`, `npm run format`, `./mvnw spotless:check`.
3. **Test** – `npm run test`, `./mvnw verify`.
4. **Build** – package backend (`jar`) and frontend (`npm run build`).
5. **Scan** – security/dependency checks.

Pipelines must pass before merging. Failing pipelines block merges until fixed.

## Release Process

1. Ensure `main` is green and all blocking bugs resolved.
2. Update version numbers (backend `pom.xml`, frontend `package.json` if needed).
3. Generate changelog summarizing features, fixes, migrations.
4. Tag release (`vX.Y.Z`) and push tag.
5. Publish release artifacts (Docker images, jars). Notify stakeholders.

For major features, run a go/no-go checklist covering performance, security, and documentation readiness.

## Post-Release

- Monitor logs and metrics for regressions during the first 24 hours.
- If an issue arises, decide between hotfix (critical) or next release (non-critical).
- Capture lessons learned in the release notes or postmortem.

## Documentation

- Update READMEs and guideline files when workflows change.
- Keep onboarding docs current so new engineers can follow the process without tribal knowledge.

Following this workflow keeps delivery predictable and reduces surprises for downstream teams.

