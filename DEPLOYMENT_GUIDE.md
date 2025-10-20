# 🚀 FoodExpress Production Deployment Guide

## ✅ Pre-Deployment Status

- [x] Project structure validated
- [x] Environment configurations prepared
- [x] CORS configuration updated for production
- [x] Health check endpoints added
- [x] Production environment files created
- [x] Payment methods simplified (Cash on Delivery only)
- [x] Order calculation bugs fixed

## 📋 Step-by-Step Deployment Process

### 1. 🗄️ Setup MongoDB Atlas (Required First)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/FoodExpress`)
5. Replace `<password>` with your database password
6. Whitelist IP: `0.0.0.0/0` (or Render's IP ranges)

### 2. 🔥 Setup Firebase (Required)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project: `foodexpress-c09c9`
3. **Authentication** → **Settings** → **Authorized domains**
   - Add your Render frontend URL: `your-app-name.onrender.com`
4. **Project Settings** → **Service Accounts**
   - Generate new private key (download JSON)
   - Extract values for backend environment variables

### 3. 🖥️ Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:

   ```
   Name: foodexpress-backend
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

5. **Environment Variables** (Add these in Render):

   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/FoodExpress
   JWT_SECRET=generate_32_character_random_string
   SESSION_SECRET=generate_random_session_secret
   FRONTEND_URL=https://your-frontend-app.onrender.com
   FIREBASE_PROJECT_ID=foodexpress-c09c9
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@foodexpress-c09c9.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
   ADMIN_EMAIL=admin@foodexpress.com
   ADMIN_PASSWORD=your_secure_admin_password
   ```

6. Deploy and note the backend URL: `https://foodexpress-backend-xxxx.onrender.com`

### 4. 🌐 Deploy Frontend to Render

1. Create new "Static Site" in Render
2. Connect same GitHub repository
3. Configure:

   ```
   Name: foodexpress-frontend
   Branch: main
   Root Directory: client
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **Environment Variables** (Add these in Render):

   ```
   VITE_API_URL=https://your-backend-app.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-app.onrender.com
   VITE_APP_NAME=FoodExpress
   VITE_APP_VERSION=1.0.0
   VITE_NODE_ENV=production
   VITE_FIREBASE_API_KEY=AIzaSyBxL1JlO0bhtLSf9t1mvvvK1cGDTZIYwzk
   VITE_FIREBASE_AUTH_DOMAIN=foodexpress-c09c9.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=foodexpress-c09c9
   VITE_FIREBASE_STORAGE_BUCKET=foodexpress-c09c9.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=665515949459
   VITE_FIREBASE_APP_ID=1:665515949459:web:fec589a37080f4889c7c66
   ```

5. Deploy and note the frontend URL: `https://foodexpress-frontend-xxxx.onrender.com`

### 5. 🔄 Update Backend FRONTEND_URL

1. Go back to your backend service in Render
2. Update the `FRONTEND_URL` environment variable with your actual frontend URL
3. Trigger a redeploy

### 6. ✅ Verify Deployment

Test these endpoints:

- Backend health: `https://your-backend.onrender.com/health`
- Backend API: `https://your-backend.onrender.com/api/products`
- Frontend: `https://your-frontend.onrender.com`

## 🛠️ Troubleshooting Common Issues

### CORS Errors

- Verify `FRONTEND_URL` matches your actual frontend domain
- Check browser console for specific CORS messages
- Ensure both HTTP and HTTPS are handled

### Database Connection Issues

- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas (use 0.0.0.0/0)
- Ensure database password doesn't contain special characters

### Firebase Authentication Issues

- Add Render domains to Firebase authorized domains
- Verify all Firebase environment variables are correct
- Check Firebase project settings

### Build Failures

- Check Render build logs for specific errors
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

## 🔒 Security Considerations

1. **Environment Variables**: Never commit real secrets to git
2. **MongoDB**: Use strong passwords and IP restrictions
3. **Firebase**: Regularly rotate service account keys
4. **Admin Password**: Use a strong, unique password
5. **JWT Secret**: Use a cryptographically secure random string

## 📊 Monitoring

- Monitor Render logs for errors
- Set up MongoDB Atlas monitoring
- Use Firebase Analytics for user tracking
- Consider setting up error tracking (Sentry, etc.)

## 🚀 Post-Deployment

1. Test complete user flow: Registration → Login → Order → Admin panel
2. Verify order calculations are correct
3. Test admin functionality
4. Set up regular database backups
5. Monitor application performance

## 💡 Free Tier Limitations

**Render Free Tier:**

- Services spin down after 15 minutes of inactivity
- Cold starts may take 30+ seconds
- 750 hours/month limit per service

**MongoDB Atlas Free Tier:**

- 512MB storage limit
- Limited to 100 connections

**Firebase Free Tier:**

- 50K reads/day, 20K writes/day
- 1GB storage

Your application is now ready for production deployment! 🎉
