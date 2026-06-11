# Doctor Consultation Web Application

A full-stack web application that enables admins to onboard doctors, users to browse and filter doctors, and book consultation slots with double-booking prevention.

## Project Overview

This application implements a complete doctor consultation booking system with:
- **Admin Panel** for managing doctors (CRUD operations) and their available time slots
- **Doctor Listing** with filtering by specialization, experience, fee, and name search
- **Slot Booking** with real-time availability, double-booking prevention, and booking confirmation
- **Booking Management** with a complete list of all bookings

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (via sql.js — pure JS, zero native deps) |
| Validation | Zod |
| HTTP Client | Axios |
| Routing | React Router v6 |

## Architecture

```
doctor-consultation-app/
├── backend/
├── prisma/
│   │   ├── schema.prisma          # Database schema (reference)
│   │   └── seed.ts                # Seed data (10 doctors)
│   └── src/
│       ├── database.ts            # SQLite setup (sql.js)
│       ├── seed.ts                # Seed script
│       ├── controllers/           # Request handlers
│       ├── routes/                # API route definitions
│       ├── services/              # Business logic layer
│       ├── validators/            # Zod validation schemas
│       ├── middleware/            # Error handling middleware
│       ├── types/                 # TypeScript interfaces
│       └── app.ts                 # Express server entry point
├── frontend/
│   └── src/
│       ├── pages/                 # Route-level page components
│       ├── components/            # Reusable UI components
│       ├── services/              # API client (Axios)
│       ├── hooks/                 # Custom React hooks
│       ├── types/                 # TypeScript interfaces
│       └── App.tsx                # Root component with routes
└── package.json                   # Root scripts with concurrently
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm

### Quick Start

```bash
# 1. Install all dependencies (root, backend, frontend)

# 2. Seed the database with sample data
cd backend && npm run seed 

# 3. Start both servers
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- ** For adming acess** : Username - admin , Password - admin123

## API Documentation

### Doctor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/doctors` | Create a new doctor |
| GET | `/api/doctors` | List all doctors (with optional filters) |
| GET | `/api/doctors/:id` | Get doctor by ID |
| PUT | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor |

#### Query Parameters for GET /api/doctors
- `specialization` — Filter by specialization (e.g., `Cardiology`)
- `experience` — Minimum years of experience
- `maxFee` — Maximum consultation fee
- `name` — Search by name (partial match)

#### Create Doctor Request Body
```json
{
  "name": "Dr. John Doe",
  "specialization": "Cardiology",
  "experience": 10,
  "consultationFee": 500,
  "slots": ["2026-06-15T09:00:00.000Z", "2026-06-15T10:00:00.000Z"]
}
```

### Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings` | List all bookings |

#### Create Booking Request Body
```json
{
  "doctorId": "uuid-of-doctor",
  "userName": "Patient Name",
  "slotTime": "2026-06-15T09:00:00.000Z"
}
```

### Error Responses
- `400` — Validation error (invalid input)
- `404` — Resource not found (doctor or slot)
- `409` — Conflict (slot already booked)
- `500` — Internal server error

## Design Decisions

1. **SQLite with sql.js**: Chosen for zero-configuration, zero native dependency setup. sql.js is a pure JavaScript/WASM SQLite implementation that requires no compilation step and runs anywhere Node.js runs.

2. **Separate Slot Model**: Slots are stored as separate records rather than embedded arrays, enabling atomic updates and preventing race conditions during booking.

3. **Transaction-based Booking**: Bookings verify slot availability immediately before marking it booked, preventing double booking in a single-process environment. SQLite's serialized write model provides natural protection against concurrent conflicts.

4. **Service Layer Pattern**: Business logic is separated from controllers into service classes, improving testability and separation of concerns.

5. **Zod Validation**: All API inputs are validated with Zod schemas, providing type-safe validation with descriptive error messages.

6. **Custom Hooks**: Frontend data fetching is abstracted into custom hooks (`useDoctors`, `useDoctor`, `useBookings`) for reusability and clean component code.

7. **Vite Proxy**: The frontend Vite dev server proxies `/api` requests to the backend, avoiding CORS issues during development.

## Assumptions
- No authentication is required (as specified in the assignment constraints)
- Slot times are stored as ISO 8601 datetime strings
- Once a slot is booked, it cannot be cancelled (no cancellation feature)
- The seed data generates slots for the next 7 days with standard clinic hours (9 AM – 5 PM)


| Page | Description |
|------|-------------|
| Doctor Listing | Browse doctors with filters for specialization, experience, fee, and name |
| Doctor Details | View doctor info, available slots grouped by date, and book a consultation |
| Bookings | Table view of all bookings with patient, doctor, and slot details |
| Admin Panel | CRUD interface for managing doctors and their time slots |
