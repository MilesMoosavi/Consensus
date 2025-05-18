# Backend Deployment Guide

This guide provides instructions for deploying the Consensus backend with authentication.

## Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account (for production)
- Google Developer Console account (for OAuth)
- Vercel account (or another hosting platform)

## Deployment Steps

### 1. Set Up MongoDB Atlas

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster
3. Set up database access with a username and password
4. Create a database named `consensus`
5. Get your connection string which should look like:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/consensus
   ```

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to APIs & Services > Credentials
4. Configure the OAuth consent screen
   - Add your app name, user support email, and developer contact information
   - Add necessary scopes (email, profile)
5. Create OAuth 2.0 Client IDs
   - For development: 
     - Authorized JavaScript origins: `http://localhost:5000`
     - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
   - For production:
     - Authorized JavaScript origins: `https://consensus-seven.vercel.app`
     - Authorized redirect URIs: `https://consensus-seven.vercel.app/api/auth/google/callback`
6. Note your Client ID and Client Secret

### 3. Set Up Environment Variables

1. Create a `.env` file based on the `.env.example` template
2. Add your MongoDB URI from step 1
3. Add your Google OAuth credentials from step 2
4. Generate strong values for JWT_SECRET and SESSION_SECRET
   ```
   # Example using node
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### 4. Deploy to Vercel

1. Create a `vercel.json` file in the backend directory:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/server.js"
       }
     ]
   }
   ```

2. Push your code to GitHub

3. Connect Vercel to your GitHub repository
   - Import the project
   - Configure environment variables from your `.env` file
   - Deploy the backend

4. Note the deployment URL (e.g., `https://consensus-backend.vercel.app`)

### 5. Update Frontend Configuration

1. Update the frontend `vite.config.js` to point to your deployed backend
   ```javascript
   proxy: {
     "/api": {
       target: "https://consensus-backend.vercel.app",
       changeOrigin: true,
       secure: true,
     },
     "/auth": {
       target: "https://consensus-backend.vercel.app",
       changeOrigin: true,
       secure: true,
     }
   }
   ```

2. Update the frontend `.env` file with the production URL
   ```
   VITE_API_URL=https://consensus-backend.vercel.app/api
   VITE_AUTH_CALLBACK_URL=https://consensus-seven.vercel.app/auth/success
   ```

3. Deploy the frontend to Vercel

## Troubleshooting

### CORS Issues

If you encounter CORS errors:

1. Check the `cors` configuration in `server.js`
2. Verify that your origins are correctly configured:
   ```javascript
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? 'https://consensus-seven.vercel.app' 
       : 'http://localhost:5173',
     credentials: true
   }));
   ```

### MongoDB Connection Issues

1. Check your MongoDB URI in the environment variables
2. Verify network access settings in MongoDB Atlas
3. Check if your IP address is whitelisted in Atlas

### Google OAuth Issues

1. Verify redirect URIs match exactly (including trailing slashes)
2. Check that your app is properly configured in Google Cloud Console
3. Ensure the OAuth consent screen is configured correctly

### JWT Authentication Issues

1. Check that the JWT_SECRET is consistent
2. Verify token expiration settings
3. Check browser console for any token-related errors

## Monitoring and Logging

Consider integrating a monitoring solution:

1. Simple: Use `console.log` with Vercel logs
2. Advanced: Implement a logging service like LogRocket or Sentry
3. Performance: Consider New Relic or Datadog for production monitoring
