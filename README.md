# HotelPro

A full-stack hotel booking starter built from the supplied product brief. It contains a responsive React/Vite client and an Express/MongoDB API.

## Run locally

1. Install Node.js and MongoDB, then start MongoDB.
2. In `Server`, copy `.env.example` to `.env`, set a unique random `JWT_SECRET` and a private `ADMIN_PASSWORD`, and run `npm install`.
3. In `Client`, run `npm install` followed by `npm run dev`. Copy `.env.example` to `.env` only if the API is not at `http://localhost:5000/api`.
4. Open the Vite URL printed by the client.
5. In `Server`, run `npm run create-admin` to provision the configured administrator, then `npm run seed:demo` to add a sample hotel, local room photos, fictional guest history, and sample rooms.

## Create an administrator

Public signup always assigns the `customer` role; a client cannot promote itself by changing a request field. The trusted `npm run create-admin` script reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from the server `.env` and creates the account with a bcrypt password hash. Never expose admin creation to public signup.

## Features

- Guest registration and login, password hashing, JWT sessions, and server-enforced roles.
- Multi-hotel management in the admin dashboard: add/edit/pause hotels, set address and contact details, and delete hotels after their rooms are removed.
- Hotel-linked room management, with the hotel name and full address displayed to guests on room cards and bookings.
- Public room collection, admin room creation/deletion, and guest directory with role controls.
- Date-based reservations with overlap checks, total calculation, booking history, and cancellation.
- Responsive home, rooms, account, booking, and admin screens.
- Idempotent demo seeding with one example hotel, four fictional guests, five historical bookings, and four sample rooms. Demo imagery is stored locally in `Client/public/images`.

## Payment handling

The application calculates and records the reservation amount. It does not collect, transmit, or store card numbers or CVVs. Connect a compliant payment provider to add online payments; keep payment credentials and card data out of this application database.

## API

`GET /api/health`, `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/hotels`, `GET /api/rooms`, `GET/POST /api/bookings`, `PATCH /api/bookings/:id/cancel`, hotel and room management under `/api/admin`, and guest/role management under `/api/admin/users`. Booking states include active, cancelled, and completed.
