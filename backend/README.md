# Food Express Backend

This is the backend server for the Food Express application, built with Node.js, Express, and MongoDB.

## 🚀 Features

- RESTful API endpoints
- JWT Authentication
- Real-time notifications using Socket.IO
- Order management system
- Product and category management
- Cart functionality
- User management

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT for authentication
- Firebase Admin SDK

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## ⚙️ Installation

1. Clone the repository:

```bash
git clone https://github.com/crazy-sam-02/foodexpress.git
cd foodexpress/backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start the development server:

```bash
npm run dev
```

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart

- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders

- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (Admin)

## 📦 Project Structure

```
backend/
├── config/
│   └── firebase-service-account.json
├── middleware/
│   └── auth.js
├── models/
│   ├── Cart.js
│   ├── Category.js
│   ├── Order.js
│   ├── Product.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── cart.js
│   ├── categories.js
│   ├── orders.js
│   └── products.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

## 🔒 Security

- JWT token-based authentication
- Firebase Admin SDK for additional security
- Request validation
- Error handling middleware
- CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
