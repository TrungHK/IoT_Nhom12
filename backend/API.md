# Backend API

All `/api/*` routes require a Firebase Authentication ID token in the header:

```http
Authorization: Bearer <firebase-id-token>
```

The profile in `parking/users/{uid}` determines the server role (`admin`, `manager`, `staff`). Locked, missing, or unknown-role profiles are rejected. `GET /health` remains public for process monitoring.

- `GET /api/auth/me` — return the authenticated account and role.

## Accounts (admin)

- `GET /api/users` — list account profiles.
- `POST /api/users` — create a Firebase Auth account and profile. Body: `{ "email", "password", "fullName", "role" }`.
- `PATCH /api/users/:uid` — update `fullName`, `role`, or `status` (`active` / `locked`).
- `DELETE /api/users/:uid` — delete an account. The current account cannot delete or lock itself.

Account changes are recorded under `parking/auditLogs`.

## Parking history and reporting

- `GET /api/parking/logs?page=1&limit=50&gate=entry&q=UID&from=<ms>&to=<ms>` — filter by gate, UID/plate keyword, and inclusive millisecond timestamps. Page size is capped at 100. The query scans at most the latest 2,000 matching-time records.
- `GET /api/reports/summary?from=<ms>&to=<ms>` — traffic totals, card type/status counts, occupancy snapshot, and daily totals. The default range is the previous 30 days.

Managers and admins can view reports. Staff can query parking history. `/api/parking/status` and `/api/parking/barrier` remain available to authenticated roles.

## Cards

The existing endpoints remain under `/api/cards` and require manager or admin role.

## Monitoring

- `GET /health` — public process health and server timestamp.
