# Campus Cravings API (MVP)

Base URL: `/api`

## Auth
- `POST /auth/register`
- `POST /auth/login`

## Restaurants
- `GET /restaurants`
- `GET /restaurants/:id`
- `GET /restaurants/:id/menu`

## Menu (admin only)
- `POST /menu`
- `PUT /menu/:id`
- `DELETE /menu/:id`

## Orders
- `POST /orders` (student places order)
- `GET /orders/:userId`
- `GET /orders/restaurant/:id` (restaurant/admin incoming orders)
- `PATCH /orders/:id/cancel` (student cancels own pending unpaid order)
- `PATCH /orders/:id/status` (restaurant/admin)
  - Allowed transitions: `pending -> accepted -> out_for_delivery -> completed`
  - `pending -> canceled` also allowed

`POST /orders` requires:
- `deliveryName`
- `deliveryPhone`
- `deliveryAddress`
- `deliveryInstructions` (optional)

## Payments
- `POST /payments/checkout-session` (auth required)
- `PATCH /payments/orders/:id/refund` (admin only, paid orders)
- `POST /payments/webhook` (Stripe webhook)

## Security
- Password hashing: `bcryptjs`
- JWT auth middleware
- Role-based access (`student`, `restaurant`, `admin`)
- Input validation (`express-validator`)
- Rate limiting (`express-rate-limit`)
