# Campus Cravings Frontend (React)

## Setup
1. Copy env
   - `cp .env.example .env`
2. Install dependencies
   - `npm install`
3. Run dev server
   - `npm run dev`

## Required env
- `VITE_API_URL` (example: `http://localhost:4000/api`)
- `VITE_STRIPE_PUBLISHABLE_KEY` (Stripe public key)

## Docker
From project root:
- `cp .env.docker.example .env`
- `docker compose up --build`

Frontend is served at `http://localhost:5173`.

## Included views
- Student: restaurants, menu, cart, checkout, my orders
- Restaurant/Admin: incoming orders view + status updates
- Admin: menu management (create/update availability/delete)
