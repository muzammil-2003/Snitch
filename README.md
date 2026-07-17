# Snitch

Snitch is a work-in-progress full-stack product catalog and seller dashboard built with React, Vite, Express, MongoDB, and JWT-based authentication. The app supports buyer and seller accounts, Google sign-in, product browsing, seller-only product creation, and image uploads.

## Features

- Buyer and seller registration/login
- Google OAuth sign-in
- JWT authentication with cookie-based sessions
- Seller-only dashboard and product creation
- Product image upload and storage via ImageKit
- Public product catalog and product detail view
- Search, sort, and filter UI in the frontend

## Tech Stack

- Frontend: React 19, Vite, React Router, Redux Toolkit, Tailwind CSS
- Backend: Node.js, Express 5, MongoDB, Mongoose
- Authentication: JWT, bcryptjs, Passport Google OAuth 2.0
- File Uploads: Multer, ImageKit

## Project Structure

```text
Snitch/
├── Backend/
│   ├── server.js
│   └── src/
│       ├── controllers/
│       ├── config/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── validator/
├── Frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       └── features/
└── README.md
```

## Prerequisites

- Node.js 18+ recommended
- MongoDB database
- Google OAuth credentials
- ImageKit private key

## Setup

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd Snitch
```

### 2) Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file inside `Backend/`:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

Start the backend:

```bash
npm run dev
```

The backend runs on `http://localhost:3000` by default.

### 3) Frontend setup

Open a new terminal:

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## Available Pages

- `/` - Home / product catalog
- `/register` - Create account
- `/login` - Sign in
- `/product/:productId` - Product details
- `/seller/create-product` - Seller product creation
- `/seller/dashboard` - Seller dashboard

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/me`

### Products

- `POST /api/products`
- `GET /api/products`
- `GET /api/products/seller`
- `GET /api/products/detail/:id`

## Notes

- Seller-only routes are protected on both the frontend and backend.
- Product creation accepts up to 7 images, each capped at 5 MB.
- The Google callback and frontend redirect are currently configured for local development.
- This project is still under active development, so features may change.

## License

No license has been added yet.
