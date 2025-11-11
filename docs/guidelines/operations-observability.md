# Operations & Observability

Reliable systems depend on good telemetry and clear operational playbooks. Use this guideline to configure logging, monitoring, and incident response.

## Logging

- Use SLF4J for backend logs and the centralized logging configuration in `logback-spring.xml`.
- Log context-rich messages (`requestId`, `userId`, `entityId`). Avoid logging sensitive data (passwords, tokens, PII).
- Log levels:
  - `DEBUG` – development diagnostics (disabled in prod).
  - `INFO` – lifecycle events (start, stop, major state changes).
  - `WARN` – recoverable issues requiring attention.
  - `ERROR` – failures that impact functionality.
- Frontend logs should go through a centralized handler to capture client-side errors (e.g., Sentry).

## Metrics

- Expose Micrometer metrics via `/management/prometheus`. Include:
  - HTTP request duration (`http.server.requests`).
  - Database query timings.
  - Business counters (orders processed, exports generated).
- Tag metrics with environment, service, and region to support dashboards.
- Use Grafana dashboards for real-time visibility. Document dashboards in the team wiki.

## Tracing

- Propagate trace IDs using Spring Cloud Sleuth or OpenTelemetry.
- Include trace headers (`X-B3-TraceId`) in logs for correlation.
- Instrument critical external calls (payment, inventory) to capture latency and error rates.

## Alerting

- Configure Prometheus alert rules for:
  - High error rate or latency.
  - Elevated JVM memory usage.
  - Missing heartbeats or service downtime.
- Integrate alerts with on-call tooling (PagerDuty, Opsgenie, Slack).  
  Include runbook links in alert messages.

## Runbooks

- Maintain runbooks for common incidents (database failover, queue backlog, API outage).
- Each runbook should list:
  1. Symptoms and detection method.
  2. Immediate actions / mitigation steps.
  3. Escalation contacts.
  4. Verification/rollback steps.

## Deployments & Rollbacks

- Prefer blue/green or rolling deployments to minimize downtime.
- Keep database migrations backward compatible; apply feature toggles where necessary.
- Document rollback procedures. Automated rollback scripts should be tested quarterly.

## Incident Response

1. Acknowledge alert and assign incident commander.
2. Communicate status in the incident channel and stakeholder updates.
3. Stabilize the system first, then diagnose root cause.
4. After resolution, hold a blameless postmortem within 3 business days:
   - Timeline of events.
   - What went well / poorly.
   - Action items with owners and due dates.

## Capacity Planning

- Review resource usage monthly. Forecast growth based on historical metrics.
- Test failover scenarios and autoscaling policies regularly.
- Document infrastructure diagrams and update when architecture changes.

Operational excellence is an ongoing effort. Update this document whenever new tooling or practices are introduced.

