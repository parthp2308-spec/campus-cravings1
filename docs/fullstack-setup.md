# Campus Cravings Full-Stack Setup

## 1. Prerequisites
- Node.js 20+
- npm
- PostgreSQL 14+
- Stripe account + Stripe CLI

## 2. Backend
```bash
cd "/Users/parthpawar/Desktop/Delivery Serivce/backend"
cp .env.example .env
# edit .env with DATABASE_URL, JWT_SECRET, STRIPE keys
npm install
psql "$DATABASE_URL" -f sql/schema.sql
psql "$DATABASE_URL" -f sql/migrations/001_add_payment_columns.sql
psql "$DATABASE_URL" -f sql/migrations/002_add_delivery_fee_columns.sql
psql "$DATABASE_URL" -f sql/migrations/003_order_delivery_details_and_cancel_status.sql
psql "$DATABASE_URL" -f sql/migrations/004_order_status_refund_and_payment_updates.sql
psql "$DATABASE_URL" -f sql/seed.sql
npm run dev
```
Backend runs on `http://localhost:4000`.

## 3. Frontend
```bash
cd "/Users/parthpawar/Desktop/Delivery Serivce/frontend"
cp .env.example .env
# set VITE_API_URL and VITE_STRIPE_PUBLISHABLE_KEY
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## Docker (recommended)
1. From project root:
```bash
cd "/Users/parthpawar/Desktop/Delivery Serivce"
cp .env.docker.example .env
# edit .env with real JWT/Stripe keys
docker compose up --build
```
2. Services:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`
- Postgres: `localhost:5432`

3. If you need a clean DB re-seed:
```bash
docker compose down -v
docker compose up --build
```

## 4. Stripe webhook forwarding (local)
```bash
stripe listen --forward-to localhost:4000/api/payments/webhook
```
Copy webhook signing secret from CLI output into backend `.env` as `STRIPE_WEBHOOK_SECRET` and restart backend.

## 5. Test users
Seed includes:
- `student@uconn.edu` / `Password123!`
- `restaurant@uconn.edu` / `Password123!`
- `admin@uconn.edu` / `Password123!`

## 6. Core flows now implemented
- Student: browse restaurants, view live menu data from API, add to cart, register/login, place order, pay with Stripe, view order/payment status.
- Restaurant/Admin: view incoming orders and update order status.
- Admin: create/update/delete menu items from UI.
- Pricing: delivery fee auto-applied to each order (`$2.99` under `$5.00`, otherwise `$3.99`), included in totals and Stripe checkout.
- Ordering windows (ET): The Coop `11:00 AM - 7:00 PM`; all other restaurants `11:00 AM - 9:00 PM`. Backend blocks order creation outside these hours.
- Testing override: set backend env `BYPASS_ORDERING_HOURS=true` to skip ordering-time checks temporarily.
- Checkout requires delivery details (name, phone, address) and stores optional delivery instructions.
- Students can cancel only `pending` and `unpaid` orders; restaurant/admin status transitions are enforced.
- Order status flow now includes `out_for_delivery`.
- Admin can run `Cancel + Refund` for paid orders (Stripe refund API).
- Optional email/SMS notifications are available via SMTP + Twilio env config.
