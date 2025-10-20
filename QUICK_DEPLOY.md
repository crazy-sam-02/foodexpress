# 🚀 Quick Deploy to Render - Summary

## Before You Start

1. ✅ Code is ready for deployment
2. ✅ Payment methods simplified to Cash on Delivery only
3. ✅ CORS and environment configurations prepared

## Step 1: Prerequisites

- [ ] MongoDB Atlas account + cluster setup
- [ ] Firebase project `foodexpress-c09c9` configured
- [ ] Render account created

## Step 2: Deploy Backend (First)

1. Render → New Web Service
2. Root Directory: `backend`
3. Build: `npm install`
4. Start: `npm start`
5. Add all environment variables from `backend/.env.production`

## Step 3: Deploy Frontend (Second)

1. Render → New Static Site
2. Root Directory: `client`
3. Build: `npm install && npm run build`
4. Publish: `dist`
5. Add environment variables with your backend URL

## Step 4: Update & Test

1. Update backend `FRONTEND_URL` with your frontend URL
2. Redeploy backend
3. Test: `/health`, `/api/products`, frontend app

## URLs You'll Get

- Backend: `https://foodexpress-backend-xxxx.onrender.com`
- Frontend: `https://foodexpress-frontend-xxxx.onrender.com`

## 🔧 Key URLs to Update After Deployment

### In Backend Environment (Render):

```
FRONTEND_URL=https://your-actual-frontend-url.onrender.com
```

### In Frontend Environment (Render):

```
VITE_API_URL=https://your-actual-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-actual-backend-url.onrender.com
```

See `DEPLOYMENT_GUIDE.md` for complete detailed instructions! 📖
