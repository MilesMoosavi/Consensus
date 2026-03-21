# Development Setup Guide

## 🚀 How to Run the Application

### Prerequisites
- Node.js 18+ installed
- Git repository cloned

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash  
cd frontend
npm install
```

### 2. Environment Setup

**Backend Environment:**
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys (see GITHUB_MODELS_SETUP.md)
```

**Frontend Environment:**
```bash
cd frontend  
# Create .env if needed for API URL configuration
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 3. Start Development Servers

**Option A: Run Both Servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):  
```bash
cd frontend
npm run dev
```

**Option B: Quick Start Script**
```bash
# From project root
npm run dev:all
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔧 Development Commands

### Backend Commands (from `/backend`)
- `npm start` - Production server
- `npm run dev` - Development server with nodemon
- `node testGitHubModels.js` - Test GitHub Models integration

### Frontend Commands (from `/frontend`)
- `npm run dev` - Development server (Vite)
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run storybook` - Start Storybook
- `npm run lint` - Run ESLint

## 🐛 Common Issues

### "npm run dev" not found
- Make sure you're in the correct directory (`backend` or `frontend`)
- Each has their own package.json with different scripts

### Port conflicts
- Backend defaults to :5000, Frontend to :5173
- Change ports in package.json scripts if needed

### CORS errors
- Ensure backend is running before frontend
- Check VITE_API_URL in frontend/.env

### Environment variables not loading
- Verify .env files are in correct directories
- Check file names (.env not .env.txt)
- Restart servers after changing .env

## 📁 Project Structure
```
Consensus/
├── backend/           # Express.js API server
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── models/        # Data models  
│   └── server.js      # Main server file
├── frontend/          # React application  
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
└── github-models-integration/  # GitHub Models package
```
