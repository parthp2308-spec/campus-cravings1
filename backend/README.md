# Campus Cravings Backend (MVP)

## Stack
- Node.js + Express
- PostgreSQL
- JWT auth
- Stripe Checkout + webhook
- MVC folder structure

## Quick Start
1. Copy env file
   - `cp .env.example .env`
2. Install dependencies
   - `npm install`
3. Create database and run schema
   - `psql "$DATABASE_URL" -f sql/schema.sql`
   - If you already created the DB with an older schema, run:
   - `psql "$DATABASE_URL" -f sql/migrations/001_add_payment_columns.sql`
   - `psql "$DATABASE_URL" -f sql/migrations/002_add_delivery_fee_columns.sql`
   - `psql "$DATABASE_URL" -f sql/migrations/003_order_delivery_details_and_cancel_status.sql`
   - `psql "$DATABASE_URL" -f sql/migrations/004_order_status_refund_and_payment_updates.sql`
4. Seed demo data
   - `psql "$DATABASE_URL" -f sql/seed.sql`
5. Start API
   - `npm run dev`

## Docker
From project root:
- `cp .env.docker.example .env`
- `docker compose up --build`

Backend will be available on `http://localhost:4000`.

## Stripe Webhook (local)
Use Stripe CLI while backend is running:
- `stripe listen --forward-to localhost:4000/api/payments/webhook`
- Put the generated signing secret into `STRIPE_WEBHOOK_SECRET`

## API Docs
- OpenAPI spec: `docs/openapi.yaml`
- Postman collection: `docs/postman_collection.json`
- Endpoint summary: `docs/API.md`

## Notes
- Server calculates order totals from DB prices.
- Delivery fee policy is server-enforced: `$2.99` for subtotal `< $5.00`, otherwise `$3.99`.
- Ordering windows are server-enforced (ET): The Coop `11:00 AM - 7:00 PM`, all other restaurants `11:00 AM - 9:00 PM`.
- Unavailable items cannot be ordered.
- Payment status is tracked on orders (`pending|paid|failed`).
- Orders now include required delivery details (`name`, `phone`, `address`) plus optional `delivery_instructions`.
- Status transitions are enforced: `pending -> accepted -> out_for_delivery -> completed` and `pending -> canceled`.
- Admin can trigger Stripe refunds on paid orders via `PATCH /api/payments/orders/:id/refund` (marks order canceled + refunded).
- Email/SMS notifications are sent best-effort for order events when SMTP/Twilio env vars are configured.
- Admin-only menu mutation endpoints are protected by JWT + role checks.
