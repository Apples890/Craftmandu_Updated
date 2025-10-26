# Backend ↔ Supabase Smoke Tests

This folder helps you validate your environment, CORS, auth, RLS, and basic API routes before wiring the UI.

## Prereqs
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWKS_URL` set in your **backend** `.env`
- Backend running on `http://localhost:4000` (or set your own base in the .http file)
- `pnpm add -D ts-node @types/node`

## 1) SDK connectivity
```bash
pnpm ts-node scripts/test-supabase.ts
```
Expected: 3x **OK** for anon select, service count, and storage upload.

## 2) RLS behavior (anon vs JWT)
- First run without token (should be limited)
- Then set `ACCESS_TOKEN` env to a real Supabase access token and run again

```bash
ACCESS_TOKEN="eyJ..." pnpm ts-node scripts/test-rls.ts
```

## 3) API routes via REST client (or curl)
Install the VS Code REST Client extension and open `routes.http`. Click **Send Request** above each section.
Or just use curl equivalents included inline as comments.
