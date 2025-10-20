# FoodExpress - Food Delivery Application

A modern food delivery application built with React, TypeScript, Node.js, and MongoDB.

## Features

- 🛒 Shopping cart with real-time updates
- 🔐 Firebase authentication with Google Sign-in
- 💳 Secure checkout process
- 📱 Responsive design for mobile and desktop
- 👨‍💼 Admin dashboard for order management
- 💰 Currency display in Indian Rupees (₹)
- 🚚 Free shipping on orders above ₹500

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Firebase Authentication

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- Firebase Admin SDK
- JWT Authentication
- Session-based admin auth

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Firebase project with authentication enabled

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/crazy-sam-02/foodexpress.git
cd foodexpress
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your actual values:

```env
# Database
MONGO_URI=mongodb://localhost:27017/FoodExpress

# Security (Generate strong random strings)
JWT_SECRET=your_32_character_secret_key
SESSION_SECRET=your_session_secret_key

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"

# Admin Credentials
ADMIN_EMAIL=admin@foodexpress.com
ADMIN_PASSWORD=your_strong_password
```

#### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication → Sign-in method → Google
4. Generate service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Copy the values to your `.env` file

#### Start Backend Server

```bash
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
npm install
```

#### Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file if needed (defaults should work for local development):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=FoodExpress
VITE_NODE_ENV=development
```

#### Firebase Client Configuration

Update `client/src/lib/firebase.ts` with your Firebase project configuration:

```typescript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
};
```

#### Start Frontend Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Admin Access

- **Email**: admin@foodexpress.com (or your custom email from .env)
- **Password**: Your password from .env file
- **Admin Panel**: `http://localhost:5173/admin/login`

## Currency Configuration

The application is configured for Indian Rupees (₹):

- Free shipping on orders ₹500 and above
- Shipping cost: ₹50 for orders under ₹500
- All prices display in ₹ format

## Project Structure

```
foodexpress/
├── backend/
│   ├── routes/          # API routes
│   ├── models/          # Database models
│   ├── middleware/      # Auth and validation middleware
│   ├── config/          # Firebase service account
│   └── .env.example     # Environment template
├── client/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages
│   │   ├── contexts/    # React context providers
│   │   ├── lib/         # Utilities and configurations
│   │   └── types/       # TypeScript type definitions
│   └── .env.example     # Environment template
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/firebase-login` - Firebase token authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/admin/logout` - Admin logout

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders

- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/admin` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)

## Development

### Available Scripts

#### Backend

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

#### Frontend

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in your environment
2. Ensure MongoDB connection string points to production database
3. Update `FRONTEND_URL` to your production frontend URL

### Frontend Deployment

1. Update `VITE_API_URL` to your production API URL
2. Run `npm run build`
3. Deploy the `dist/` folder to your hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit with descriptive messages
5. Push to your fork
6. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue on GitHub or contact the development team.
