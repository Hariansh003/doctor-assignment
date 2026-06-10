# Backend Tests

## Overview

Comprehensive unit and integration tests for the Doctor Consultation API using **Vitest** and **Supertest**.

## Test Structure

```
tests/
├── setup.ts          # Test DB initialization, seed data, helpers
├── doctors.test.ts   # Doctor CRUD + filter tests (15 tests)
├── bookings.test.ts  # Booking creation, validation, race conditions (9 tests)
└── auth.test.ts      # Login, JWT validation, protected routes (10 tests)
```

## Running Tests

```bash
cd backend

# Run all tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

## Test Coverage (34 tests)

### Doctor APIs (15 tests)
- GET all doctors — returns 3 seeded doctors
- Filter by specialization — exact name/fee/experience match
- Filter by maxFee — returns only doctors under threshold
- Filter by experience — returns doctors with min experience
- Filter by name search — partial match
- Empty result for non-matching filter
- GET doctor by ID — exact field validation
- 404 for non-existent doctor
- POST create doctor — with valid JWT
- 400 for invalid doctor data
- 401 without auth token
- PUT update doctor — partial update, unchanged fields preserved
- 404 for updating non-existent doctor
- DELETE doctor — verifies deletion
- 404 for deleting non-existent doctor

### Booking APIs (9 tests)
- Book available slot — status 201, exact field values
- 409 for already-booked slot
- 404 for non-existent doctor
- 404 for non-existent slot time
- 400 for invalid booking data
- Sequential double-booking prevention — DB verification
- GET bookings — empty and populated states
- GET bookings — doctor details included
- **Race condition test** — concurrent Promise.all, one 201 + one 409

### Authentication (10 tests)
- Login with valid credentials — JWT payload verification
- 401 for wrong password
- 401 for wrong username
- 400 for missing fields
- Protected route access with valid token
- 401 without token on protected route
- 401 with invalid JWT
- 401 with expired JWT
- Public GET /api/doctors remains accessible
- Public POST /api/bookings remains accessible

## Test Data

Tests use a fixed seed set for exact-value assertions:

| Doctor | Specialization | Experience | Fee |
|--------|---------------|-----------|-----|
| Dr. Raj Sharma | Cardiology | 12 | ₹1000 |
| Dr. Sneha Iyer | Dermatology | 7 | ₹600 |
| Dr. Amit Patel | Pediatrics | 15 | ₹800 |

## Race Condition Test

The race condition test fires two simultaneous booking requests via `Promise.all` and asserts that exactly one succeeds (201) and one fails (409), with only one booking record in the database. This validates the atomic `UPDATE...WHERE isBooked=0` pattern in the booking service.
