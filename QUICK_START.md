# Quick Start Guide

## Local Development Setup

### Prerequisites
- Node.js v18+ 
- Google Gemini API Key (get it at https://aistudio.google.com/app/apikey)
- Optional: Campay credentials for payment testing

### Step 1: Clone & Install

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Step 2: Environment Variables

Both `.env` files are already configured for local development:
- **Backend**: `backend/.env` (has your API keys)
- **Frontend**: `frontend/.env` (points to localhost:3001)

### Step 3: Start Developing

- Frontend opens at: http://localhost:5173
- Backend runs at: http://localhost:3001
- Data persists in localStorage (browser)

### Testing Features

#### AI Generation
1. Fill in some resume data
2. Select a target role
3. Click "Generate with AI"
4. Preview the AI-enhanced content

#### Download (No Payment Required Locally)
- Click "Download" to save as PDF
- Uses browser's print-to-PDF feature

#### Payments (Optional)
- Currently uses Campay demo mode
- Uses local `payments.json` for transaction tracking
- In production, requires real database

## Production Deployment

⚠️ **IMPORTANT:** Before deploying to production, read `DEPLOYMENT.md`

Key requirements:
1. Set up PostgreSQL database (not filesystem)
2. Configure production API keys
3. Update CORS origins
4. Enable HTTPS
5. Set up monitoring

See `DEPLOYMENT.md` for complete checklist.

## Troubleshooting

**Frontend not connecting to backend?**
```
Check:
- Backend is running on port 3001
- VITE_BACKEND_URL in frontend/.env is correct
- No firewall blocking port 3001
```

**AI generation not working?**
```
Check:
- GEMINI_API_KEY is valid in backend/.env
- Backend server is running
- Network connection is stable
```

**PDF download not working?**
```
Check:
- You're using a Chromium-based browser
- JavaScript is enabled
- You have enough storage
```

## File Structure

```
resumeai-builder/
├── backend/
│   ├── .env                 # Configuration (add your API keys)
│   ├── .env.example         # Template for .env
│   ├── server.js           # Express server
│   └── payments.json       # Local transaction log
├── frontend/
│   ├── .env                # Frontend config
│   ├── src/
│   │   ├── App.tsx         # Main app
│   │   ├── types.ts        # TypeScript interfaces
│   │   └── components/     # React components
│   └── vite.config.ts      # Build config
├── DEPLOYMENT.md           # Production guide
└── QUICK_START.md         # This file
```

## Common Commands

```bash
# Backend
npm start              # Production start
npm run dev            # Development with auto-reload

# Frontend
npm run dev            # Start dev server
npm run build          # Create production build
npm run preview        # Preview production build
```

## Support

- Check error messages in browser console (F12)
- Check backend logs in terminal
- Verify all environment variables are set
- Ensure ports 3001 and 5173 are not in use
