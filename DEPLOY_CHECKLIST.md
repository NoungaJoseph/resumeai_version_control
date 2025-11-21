# 🚀 DEPLOYMENT CHECKLIST - Follow This Step by Step

## YOUR CURRENT STATUS
✅ Backend code ready for PostgreSQL
✅ PostgreSQL driver installed (pg)
✅ Database file (db.js) created
✅ Environment variables configured for local dev

---

## STEP 1: Set Up PostgreSQL Database (Choose ONE option)

### ⭐ OPTION 1: Render PostgreSQL (EASIEST & RECOMMENDED)

**A. Create Account & Database**
1. Go to https://render.com/register
2. Sign up with GitHub
3. Go to Dashboard
4. Click "New +" → Select "PostgreSQL"
5. Fill in:
   - **Name**: `resumeai-db`
   - **Database**: `resumeai`
   - **User**: `postgres`
   - **Region**: Select your region
   - **PostgreSQL Version**: 14 or higher
6. Click "Create Database"
7. **Wait 2-3 minutes** for it to initialize

**B. Get Your Connection String**
1. In Render dashboard, click your database
2. Look for **"Internal Database URL"** (for backend)
3. Copy it - looks like: `postgresql://postgres:xxxx@xxxx:5432/resumeai`
4. Save this! You'll need it in Step 3

**C. Test Connection (Optional)**
Open terminal and test:
```bash
psql "postgresql://postgres:password@hostname:5432/resumeai"
# If it connects, you're good!
# Type \q to exit
```

---

### OPTION 2: Railway PostgreSQL (Alternative)

1. Go to https://railway.app
2. Click "New Project" → PostgreSQL
3. Copy the connection string
4. Skip to **STEP 3**

---

### OPTION 3: Local PostgreSQL (For Testing Only)

If you want to test locally first:

**On Windows:**
```bash
# Download and install from: https://www.postgresql.org/download/windows/
# During installation, set password as: postgres
# Then database URL is: postgresql://postgres:postgres@localhost:5432/resumeai
```

---

## STEP 2: Test Backend Locally with PostgreSQL (15 minutes)

**A. Update backend .env**
```bash
cd backend
# Edit .env and update DATABASE_URL to your connection string from Step 1
# Example:
# DATABASE_URL=postgresql://postgres:mypassword@render-hostname:5432/resumeai
```

**B. Start backend**
```bash
npm run dev
```

**C. Look for this message:**
```
✅ Database schema initialized
🚀 Server running on port 3001
```

If you see it, PostgreSQL is working! 🎉

**D. Test it works**
- Open http://localhost:3001
- Should see: "Resume AI Backend is running successfully."

---

## STEP 3: Deploy Backend to Render (30 minutes)

### A. Prepare GitHub Repository

```bash
cd c:\Users\Prova\Downloads\resumeai-builder
git add .
git commit -m "Add PostgreSQL database support"
git push origin main
```

If you don't have git set up:
1. Go to https://github.com/new
2. Create repository `resumeai-builder`
3. Follow their instructions to push code

### B. Deploy to Render

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Select your GitHub repository
4. Configure:
   - **Name**: `resumeai-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (recommended for testing)

5. Click "Create Web Service"
6. **Wait 3-5 minutes** for deployment

### C. Add Environment Variables to Render

1. Go to your service → Settings
2. Click "Environment"
3. Add these variables:
   ```
   PORT=3001
   NODE_ENV=production
   GEMINI_API_KEY=AIzaSyCDnCZTR0d8RRa3Tsyn3Q221KqImeDu3CA
   CAMPAY_APP_USER=0u9ZvFH402nFK2Blcx9sHgRXuW-DCraYSue4fcA2GVelvgbleRiZYILx_OyxkNE2_VYOPwRV7ExwWshM6dDWHA
   CAMPAY_APP_PASSWORD=NO_TlubbhXadWsOMODkWzDLJcQeS3twLt8kKlaVc2AFVFrbM8BzKBH_agH3Wm2Mib0G1YtjQu4HaAF6OsdvOoQ
   DATABASE_URL=postgresql://postgres:password@your-db-hostname:5432/resumeai
   FRONTEND_URL=https://your-vercel-url.vercel.app
   CAMPAY_BASE_URL=https://demo.campay.net/api
   ```

4. Click "Save"
5. Render will redeploy automatically

### D. Get Your Backend URL

1. In Render dashboard, find your service
2. Copy the URL at the top (looks like: `https://resumeai-backend.onrender.com`)
3. **Save this! You need it for Vercel**

### E. Test Backend

```bash
# In terminal or browser, test:
curl https://resumeai-backend.onrender.com
# Should return: "Resume AI Backend is running successfully."
```

---

## STEP 4: Deploy Frontend to Vercel (20 minutes)

### A. Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up with GitHub

### B. Import Project

1. Go to Vercel dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Configure:
   - **Framework**: React (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto)
   - **Install Command**: `npm install` (auto)

5. Click "Deploy"
6. **Wait 3-5 minutes** for deployment

### C. Add Environment Variables

1. Go to Project Settings → Environment Variables
2. Add this variable:
   ```
   VITE_BACKEND_URL=https://resumeai-backend.onrender.com
   ```
   (Use the URL from Step 3D)

3. Click "Save and Redeploy"

### D. Get Your Frontend URL

1. In Vercel dashboard, find your project
2. Copy the URL at the top (looks like: `https://resumeai.vercel.app`)
3. **Save this! You need it for backend**

---

## STEP 5: Connect Frontend & Backend (5 minutes)

### A. Update Backend FRONTEND_URL

1. Go to Render dashboard
2. Click your backend service
3. Go to Settings → Environment
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
5. Click "Save"
6. Render will redeploy

### B. Test Connection

1. Visit your frontend URL: https://your-vercel-url.vercel.app
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try to generate a resume
5. Look for API calls to your backend

If requests go to `resumeai-backend.onrender.com`, you're connected! ✅

---

## STEP 6: Test Everything (20 minutes)

### A. Test AI Generation
1. Fill in some resume data
2. Select "Software Engineer" as target role
3. Click "Generate with AI"
4. Wait for response
5. Preview should show AI-enhanced content

### B. Test PDF Download
1. Click "Download" button
2. Should show payment modal
3. Click "Unlock (10 FCFA)"
4. Select payment method
5. Enter test phone number (for demo mode)

### C. Test Database
1. In terminal, connect to your database:
   ```bash
   psql "postgresql://postgres:password@hostname:5432/resumeai"
   SELECT * FROM transactions;
   ```
2. Should see payment transactions

### D. Check Logs
- **Frontend logs**: Vercel dashboard → Deployments → Runtime logs
- **Backend logs**: Render dashboard → Logs
- Look for any errors

---

## STEP 7: Monitor & Verify (ongoing)

### First 24 Hours
- [ ] Monitor error logs (Render + Vercel dashboards)
- [ ] Test multiple features
- [ ] Verify payment flow works
- [ ] Check database connections
- [ ] Monitor uptime

### Daily
- [ ] Check transaction success rate
- [ ] Review error logs
- [ ] Verify performance
- [ ] Monitor costs

---

## ✅ DEPLOYMENT COMPLETE!

When you see this, you're done:
- ✅ PostgreSQL database running
- ✅ Backend deployed on Render
- ✅ Frontend deployed on Vercel
- ✅ Both connected and working
- ✅ Features tested
- ✅ Monitoring in place

---

## 📞 TROUBLESHOOTING

### Frontend shows "Cannot connect to backend"
- Check VITE_BACKEND_URL in Vercel
- Verify backend URL is correct
- Check browser console (F12) for error

### Backend cannot connect to database
- Verify DATABASE_URL in Render environment
- Check if PostgreSQL instance is running
- Verify credentials are correct
- Check database IP allowlist (if using AWS/other)

### Payment not working
- Verify CAMPAY credentials
- Check if using demo endpoint (good for testing)
- Test with Cameroon phone number
- Check backend logs for errors

### Deployment failed
- Check Render/Vercel build logs
- Verify all environment variables are set
- Ensure package.json has correct scripts
- Try manual redeploy

---

## NEXT STEPS

1. ✅ Create PostgreSQL database (Step 1)
2. ✅ Test locally (Step 2)
3. ⬜ Deploy backend to Render (Step 3)
4. ⬜ Deploy frontend to Vercel (Step 4)
5. ⬜ Connect them (Step 5)
6. ⬜ Test everything (Step 6)
7. ⬜ Monitor (Step 7)

**START WITH STEP 1 NOW!**
