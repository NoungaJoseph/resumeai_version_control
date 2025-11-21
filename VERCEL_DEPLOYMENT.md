# Deploy Frontend to Vercel

Follow these exact steps to deploy the React frontend to Vercel.

## Prerequisites
- GitHub account connected to Vercel (or create a Vercel account at https://vercel.com)
- Repository already pushed to GitHub: `https://github.com/NoungaJoseph/AIresume`
- Backend running on Render: `https://resumeai-backend-przb.onrender.com`

## Step-by-Step Instructions

### 1. Open Vercel Dashboard
- Go to https://vercel.com/dashboard
- Log in with your GitHub account (authorize Vercel to access your GitHub if prompted)

### 2. Create a New Project
- Click **"Add New..."** → **"Project"**
- (Or visit https://vercel.com/new directly)

### 3. Import Repository
- Search for and select the repo: **`NoungaJoseph/AIresume`**
- Click **"Import"**

### 4. Configure Project Settings

#### 4a. Select Project Root
- Under "Root Directory", enter: `frontend`
- This tells Vercel to build from the `frontend/` folder

#### 4b. Framework Detection
- Framework Preset should auto-detect: **Vite**
- If not, set it to **Vite**

#### 4c. Build Settings
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install` (default is fine)

#### 4d. Environment Variables
- Click **"Environment Variables"** (or scroll down to find the section)
- Add a new variable:
  - **Key:** `VITE_BACKEND_URL`
  - **Value:** `https://resumeai-backend-przb.onrender.com`
  - **Environments:** Select both `Preview` and `Production` (or leave as default "All")
- Click **"Add"** or **"Save"**

### 5. Deploy
- Review all settings
- Click **"Deploy"** button
- Wait for the build and deployment to complete (usually 1–2 minutes)

### 6. Get Your Live URL
- After deployment succeeds, Vercel will show your project URL (e.g., `https://airesume.vercel.app` or a generated name)
- Click the URL to open your live frontend app

## Verify Deployment

### Quick Check
1. Open your Vercel URL in a browser
2. You should see the Resume AI app interface
3. Try clicking "Generate Resume" or "Generate Cover Letter"
4. If you see the app but requests fail, check the browser console for errors (F12 → Console tab)

### Troubleshoot Common Issues

**Issue: "Failed to communicate with backend"**
- Cause: Frontend can't reach the backend URL
- Fix: 
  - Verify `VITE_BACKEND_URL` is set in Vercel environment variables
  - Verify the Render backend is running: test manually at `https://resumeai-backend-przb.onrender.com/`
  - Check browser console (F12 → Network tab) to confirm the request URL

**Issue: Build fails with "vite not found"**
- Cause: Dependencies not installed
- Fix: Vercel usually auto-installs; if it fails, re-trigger deployment or check build logs for npm errors

**Issue: Environment variables not loading**
- Cause: Variables added after deployment
- Fix: Trigger a redeploy in Vercel (Deployments → rightmost deployment → click "..." → "Redeploy")

## Next Steps

### Update Backend CORS (Optional but Recommended)
Once the frontend is live on Vercel:
1. Go to your Render dashboard → `resumeai-backend` service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your Vercel URL (e.g., `https://airesume.vercel.app`)
4. Redeploy the backend service
5. This restricts CORS to only your frontend, improving security

### Test Full Flow (Optional)
- Test generating a resume from the live app
- If payments are enabled, test a payment flow (use Campay test mode if available)
- Check Render logs for any backend errors: Render Dashboard → Service Logs

### Monitor & Maintain
- Vercel: Project → Analytics tab to monitor traffic and performance
- Render: Service → Logs tab to monitor backend health
- Both platforms provide uptime monitoring and alerting (upgrade to paid for production SLAs)

## Done! 🎉
Your app is now live on Vercel and connected to your backend on Render.
