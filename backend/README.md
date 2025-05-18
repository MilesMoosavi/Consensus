# Consensus Backend

The backend server for the Consensus app, providing authentication and API services.

## Features

- Google OAuth authentication
- User management
- Conversation storage
- Protected API routes
- JWT token-based authentication

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Google OAuth credentials

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Edit the `.env` file with your specific configuration:
- MongoDB connection string
- JWT and session secrets
- Google OAuth credentials

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to APIs & Services > Credentials
4. Click "Create Credentials" and select "OAuth client ID"
5. Configure the OAuth consent screen
6. Create an OAuth client ID for a web application
7. Add authorized redirect URIs:
   - For development: `http://localhost:5000/api/auth/google/callback`
   - For production: `https://consensus-seven.vercel.app/api/auth/google/callback`
8. Copy the Client ID and Client Secret to your `.env` file

### Running the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

## API Routes

### Authentication

- `GET /api/auth/google`: Initiates Google OAuth login
- `GET /api/auth/google/callback`: Google OAuth callback
- `GET /api/auth/status`: Check authentication status
- `GET /api/auth/logout`: Logout user
- `GET /api/auth/verify-token`: Verify JWT token

### User Management

- `GET /api/user/profile`: Get user profile
- `PUT /api/user/profile`: Update user profile
- `GET /api/user/preferences`: Get user preferences
- `PUT /api/user/preferences`: Update user preferences

### Conversations

- `GET /api/conversations`: Get all user conversations
- `GET /api/conversations/:id`: Get specific conversation
- `POST /api/conversations`: Create new conversation
- `PUT /api/conversations/:id`: Update conversation
- `POST /api/conversations/:id/messages`: Add message to conversation
- `DELETE /api/conversations/:id`: Delete conversation

## Project Structure

```
backend/
├── config/
│   └── passport.js      # Passport configuration
├── controllers/         # Route handlers
├── middleware/          # Custom middleware
├── models/              # Database models
├── routes/              # API routes
├── .env.example         # Environment variables template
├── package.json         # Project dependencies
└── server.js            # Main server file
```
