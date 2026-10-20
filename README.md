# 🏨 HotelPro — Hotel Booking and Management

A full-stack hotel booking application built with the MERN stack. HotelPro gives guests a simple way to explore rooms, see each property's address, and manage reservations. Administrators can manage hotels, rooms, guest accounts, and bookings from one dashboard.

## ✨ Features

### Guest experience

- Browse available rooms with photos, amenities, prices, and room details.
- See the hotel's name, street address, city, and country on room listings and bookings.
- Create an account, sign in, reserve rooms, review booking history, and cancel active reservations.
- View booking dates, night counts, totals, and reservation status.

### Admin dashboard

- Add hotels with descriptions, addresses, contact details, amenities, and photos.
- Edit hotel information or pause and reactivate a property.
- Add rooms to a selected hotel, set availability and nightly rates, and remove rooms without booking history.
- Review bookings, guest accounts, portfolio counts, and completed booking revenue.
- Change guest account roles. The signed-in administrator cannot change their own role.
- Delete a hotel after its rooms have been removed.

### Security and reliability

- Passwords are hashed with bcrypt; authenticated API requests use JWTs.
- Public signup creates customer accounts only. Admin accounts are provisioned from the server environment.
- The API checks roles on admin routes and checks date overlaps before confirming a reservation.
- Rate limiting protects authentication endpoints, and Helmet adds common HTTP security headers.
- Demo hotel and room images are served locally from `Client/public/images`.

## 🧰 Technology

| Area | Tools |
| --- | --- |
| Client | React, Vite, Lucide icons |
| API | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |

## 📁 Project structure

```text
HotelPro/
├── Client/                    # React and Vite application
│   ├── public/images/         # Local hotel and room photos
│   └── src/
│       ├── AdminDashboard.jsx # Hotel, room, guest, and booking controls
│       ├── App.jsx            # Guest pages, routing, and booking flows
│       └── admin.css          # Admin dashboard styles
└── Server/                    # Express API and MongoDB models
    ├── controllers/           # Authentication, hotels, rooms, bookings, users
    ├── middleware/            # Authentication and role checks
    ├── models/                # Hotel, room, booking, and user schemas
    ├── routes/                # API routes
    └── scripts/               # Admin creation and demo data seeding
```

## 🚀 Run locally

### Requirements

- Node.js and npm
- MongoDB running locally or a MongoDB connection string

### 1. Configure the API

In a terminal from the repository root:

```powershell
cd Server
Copy-Item .env.example .env
npm install
```

Edit `Server/.env`. Set a long, random `JWT_SECRET` and a private `ADMIN_PASSWORD`. Set `MONGO_URI` to your MongoDB connection string if it is not `mongodb://127.0.0.1:27017/hotelpro`.

### 2. Create the administrator and sample records

From the `Server` directory:

```powershell
npm run create-admin
npm run seed:demo
```

The demo seeder creates an example hotel, four rooms, fictional guest accounts, and historical bookings. Demo guest accounts use generated passwords and are not intended for login.

### 3. Start the API

From `Server`:

```powershell
npm run dev
```

The API defaults to `http://localhost:5000`.

### 4. Start the client

Open another terminal from the repository root:

```powershell
cd Client
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The client defaults to the API at `http://localhost:5000/api`. To change it, copy `Client/.env.example` to `Client/.env` and set `VITE_API_URL`.

## 🔌 API overview

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Public; creates a customer account |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/hotels` | Public; active hotels |
| `GET` | `/api/rooms` | Public; rooms at active hotels |
| `GET` | `/api/bookings` | Signed-in user; admins can review all bookings |
| `POST` | `/api/bookings` | Signed-in user |
| `PATCH` | `/api/bookings/:id/cancel` | Booking owner or admin |
| `GET`, `POST` | `/api/admin/hotels` | Admin |
| `PATCH`, `DELETE` | `/api/admin/hotels/:id` | Admin |
| `GET`, `POST`, `DELETE` | `/api/admin/rooms` | Admin |
| `GET` | `/api/admin/users` | Admin |
| `PATCH` | `/api/admin/users/:id/role` | Admin |

The API health check is available at `GET /api/health`.

## 💳 Payments

HotelPro calculates and stores booking totals, but it does not collect or store payment card details. Online payments require integration with a payment provider.

## 📄 License

No license has been added yet. Add a `LICENSE` file before redistributing the project under specific reuse terms.
