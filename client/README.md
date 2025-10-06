# Food Express Client

A modern, responsive food ordering application built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- 🛍️ User-friendly product browsing
- 🛒 Real-time cart management
- 👤 User authentication
- 📱 Responsive design
- 🌙 Dark mode support
- 🔔 Real-time notifications
- 📦 Order tracking
- 👑 Admin dashboard

## 🛠️ Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- Vite
- Socket.IO Client
- Firebase Authentication
- Context API for state management

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

## ⚙️ Installation

1. Clone the repository:

```bash
git clone https://github.com/crazy-sam-02/foodexpress.git
cd foodexpress/client
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

4. Start the development server:

```bash
npm run dev
```

## 📱 Pages & Features

### User Features

- Home Page with featured products
- Product listing with filters
- Shopping cart
- Checkout process
- Order history
- User profile management
- Real-time order tracking
- Notifications center

### Admin Features

- Dashboard with analytics
- Product management
- Order management
- Category management
- User management
- Sales reports

## 📦 Project Structure

```
client/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── layout/
│   │   └── ui/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── .env
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎨 UI Components

The application uses Shadcn UI components, providing:

- Consistent design language
- Accessible components
- Dark mode support
- Customizable themes
- Responsive layouts

## 🔒 Authentication & Security

- Firebase Authentication integration
- Protected routes
- Role-based access control
- Secure API calls
- Token management

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones

## 🚀 Performance

- Optimized bundle size
- Lazy loading of components
- Image optimization
- Caching strategies
- Minimized re-renders

## 🧪 Testing

Run tests with:

```bash
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
