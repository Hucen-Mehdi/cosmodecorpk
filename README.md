# CosmoDecorPK - Production Ready Website

This project is a full-stack e-commerce catalog for **CosmoDecorPK**, built with Vite, React, TypeScript, and a Node.js/Express backend.

## Project Structure

- `src/` - Frontend React application
  - `src/api/` - API service layer for backend communication
  - `src/components/` - Reusable UI components
  - `src/pages/` - Page-level components
- `server/` - Backend Node.js application
  - `server/src/` - Express server logic
  - `server/data/` - JSON files used for initial database seeding

## Features Implemented

1.  **Dynamic Product Listing**: Products are fetched from `GET /api/products` and support filtering by category, subcategory, and search.
2.  **Contact Form**: Submissions are sent to `POST /api/contact`, validated, and saved to the PostgreSQL database.
3.  **Authentication System**: Secure login and registration using JWT and bcrypt.
4.  **Admin Dashboard (Protected)**: Role-based access control for sensitive routes.
5.  **Dynamic Categories**: Navigation and filters are populated from `GET /api/categories`.
6.  **Testimonials**: Loaded dynamically on the home page via `GET /api/testimonials`.
7.  **Concurrent Development**: Both frontend and backend run simultaneously with a single command.

## Authentication & Login

The project includes a complete authentication system.

### Default Admin Credentials
- **Email**: `admin@cosmodecorpk.com`
- **Password**: `Admin123!`

### Auth Features
- **JWT Authorization**: All protected routes require a `Bearer <token>` in the `Authorization` header.
- **Session Persistence**: Authentication state is maintained across page refreshes using `localStorage` and a `/api/auth/me` check.
- **Route Protection**: The `/account` page and any future admin pages are protected via `ProtectedRoute`.

### New Auth API Endpoints
- **POST** `/api/auth/login` - Authenticate user and receive JWT.
- **POST** `/api/auth/register` - Create a new user account.
  ```bash
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name": "New User", "email": "new@example.com", "password": "Password123!"}'
  ```
- **GET** `/api/auth/me` - Get currently logged-in user info (requires token).

## How to Install

1.  Clone the repository and navigate to the root folder.
2.  Install dependencies:
    ```bash
    npm install
    ```

## How to Run

### Development Mode

Runs the frontend on `http://localhost:5173` and the backend on `http://localhost:5000`.

```bash
npm run dev
```

### Production Build

Builds both frontend and backend for production.

```bash
npm run build
```

### Production Start

Starts both the Vite preview and the compiled Node.js server.

```bash
npm run start
```

## API Documentation

### Products
- **GET** `/api/products` - Returns all products.
  - Query params: `category`, `subcategory`, `search`.
- **GET** `/api/products/:id` - Returns a single product by ID.

### Categories
- **GET** `/api/categories` - Returns all categories.

### Testimonials
- **GET** `/api/testimonials` - Returns all customer testimonials.

### Contact
- **POST** `/api/contact` - Submit a contact message.
  - Body: `{ "name": "...", "email": "...", "subject": "...", "message": "..." }`

## Example CURL Request

```bash
curl -X POST http://localhost:5000/api/contact \
-H "Content-Type: application/json" \
-d '{"name": "Hussain", "email": "hussain@example.com", "subject": "Inquiry", "message": "Hello!"}'
```

## Database Setup (PostgreSQL)

The project now uses PostgreSQL for data persistence.

### 1. Configuration
Create a `.env` file in the root directory if it doesn't exist, and add your database connection string:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
```

### 2. Migrations
Run the migrations to create the database schema (tables):

```bash
npm run db:migrate
```

### 3. Seeding
To populate the database with initial data (Products, Categories, Users):
> **WARNING:** This command requires a running PostgreSQL instance.
```bash
npm run db:seed
```
*Note: This script is idempotent and safe to run multiple times. It does NOT delete existing user data unless necessary for constraints.*

## Strict Development Rules & Troubleshooting
- **Do NOT run `npm run db:seed` blindly.** Ensure your DB is empty or you are okay with updates.
- **Do NOT manually delete tables** unless you know what you are doing. Use migrations.
- **Schema Notes:**
  - `categories.id` is a TEXT slug (e.g., "artificial-plants").
  - `products.category_id` references these slugs.
  - Subcategories are self-referenced via `parent_id`.

## Project Structure
- `server/src/repositories/` - Data access layer.
- `server/data/` - JSON seeds.

