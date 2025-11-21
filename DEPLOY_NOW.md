# 🚀 Complete Deployment Guide: Render + Vercel + PostgreSQL

## Phase 1: Set Up PostgreSQL Database (30 minutes)

### Option A: Use Render's PostgreSQL (RECOMMENDED - Easiest)

**Step 1: Create Render Account**
1. Go to https://render.com
2. Sign up with GitHub account (easier for deployments)
3. Verify email

**Step 2: Create PostgreSQL Database on Render**
1. Dashboard → New+ → PostgreSQL
2. Fill in:
   - **Name**: `resumeai-db`
   - **Database**: `resumeai` (auto-filled)
   - **User**: `postgres` (auto-filled)
   - **Region**: Choose closest to you
   - **Version**: PostgreSQL 14+
3. Click Create Database
4. Wait 2-3 minutes for creation
5. Copy the **Internal Database URL** and **External Database URL**

**Step 3: Save Database Connection Info**
Create a `.env.production` file locally with:
```env
DATABASE_URL=postgresql://username:password@hostname:5432/resumeai
```

You'll find these values in Render dashboard:
- Username: `postgres`
- Password: (shown in Render dashboard)
- Hostname: (shown in Render dashboard)
- Database: `resumeai`

---

### Option B: Use Railway PostgreSQL (Alternative)

1. Go to https://railway.app
2. New Project → PostgreSQL
3. Copy connection string
4. Skip to Step 4

---

### Option C: Use AWS RDS (Advanced/More Control)

1. AWS Console → RDS → Create Database
2. Select PostgreSQL
3. Free tier eligible: Yes
4. Configure:
   - DB instance identifier: `resumeai-db`
   - Master username: `postgres`
   - Auto generate password
5. Save credentials
6. Skip to Step 4

---

## Phase 2: Update Backend for PostgreSQL (45 minutes)

### Step 1: Install PostgreSQL Driver
```bash
cd backend
npm install pg dotenv
```

### Step 2: Create Database Migration File

Create `backend/db.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database schema
const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(255) UNIQUE NOT NULL,
        external_reference VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        amount VARCHAR(50),
        phone VARCHAR(20),
        operator VARCHAR(50),
        operator_code VARCHAR(50),
        webhook_received BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

const readDb = async (reference) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE reference = $1',
      [reference]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error reading transaction:', error);
    return null;
  }
};

const writeDb = async (reference, data) => {
  try {
    await pool.query(
      `INSERT INTO transactions (reference, external_reference, status, amount, phone, created_at, last_updated)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (reference) DO UPDATE SET
       status = $3, last_updated = NOW()`,
      [reference, data.external_reference, data.status, data.amount, data.phone]
    );
  } catch (error) {
    console.error('Error writing transaction:', error);
  }
};

const updateTransaction = async (reference, data) => {
  try {
    await pool.query(
      `UPDATE transactions 
       SET status = $1, operator = $2, operator_code = $3, webhook_received = $4, last_updated = NOW()
       WHERE reference = $5`,
      [data.status, data.operator, data.operator_code, data.webhook_received || false, reference]
    );
  } catch (error) {
    console.error('Error updating transaction:', error);
  }
};

const getTransaction = async (reference) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE reference = $1',
      [reference]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
};

module.exports = { pool, initializeDatabase, readDb, writeDb, updateTransaction, getTransaction };
```

### Step 3: Update server.js

Replace the filesystem database functions with PostgreSQL. Change lines ~47-90 in `backend/server.js`:

**OLD CODE:**
```javascript
// --- PERSISTENCE (Simple JSON File DB) ---
const DB_PATH = path.join(__dirname, 'payments.json');
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
}

const readDb = () => { ... };
const writeDb = (data) => { ... };
```

**NEW CODE:**
```javascript
// --- DATABASE ---
const { pool, initializeDatabase, readDb, writeDb, updateTransaction, getTransaction } = require('./db');

// Initialize database on startup
initializeDatabase();

// Helper function (for compatibility)
const readDb = async (reference) => {
  return await getTransaction(reference);
};

const writeDb = async (reference, data) => {
  await updateTransaction(reference, data);
};
```

### Step 4: Update .env

Add to `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@hostname:5432/resumeai
NODE_ENV=development
```

### Step 5: Test Locally

```bash
cd backend
npm run dev
```

You should see: `✅ Database schema initialized`

---

## Phase 3: Deploy Backend to Render (30 minutes)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create Backend Service

1. Dashboard → New+ → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `resumeai-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if you want)

4. Click Create Web Service
5. Wait for build (2-3 minutes)

### Step 3: Add Environment Variables

1. Go to Service Settings → Environment
2. Add these variables:
   ```
   PORT=3001
   NODE_ENV=production
   GEMINI_API_KEY=AIzaSyCDnCZTR0d8RRa3Tsyn3Q221KqImeDu3CA
   CAMPAY_APP_USER=0u9ZvFH402nFK2Blcx9sHgRXuW-DCraYSue4fcA2GVelvgbleRiZYILx_OyxkNE2_VYOPwRV7ExwWshM6dDWHA
   CAMPAY_APP_PASSWORD=NO_TlubbhXadWsOMODkWzDLJcQeS3twLt8kKlaVc2AFVFrbM8BzKBH_agH3Wm2Mib0G1YtjQu4HaAF6OsdvOoQ
   DATABASE_URL=postgresql://postgres:password@hostname:5432/resumeai
   FRONTEND_URL=https://your-frontend-vercel-url.vercel.app
   CAMPAY_BASE_URL=https://api.campay.net/api
   ```

3. Save and Render will redeploy
4. Copy your backend URL (e.g., `https://resumeai-backend.onrender.com`)

### Step 4: Add PostgreSQL Connection

If you created DB on Render:
1. Dashboard → PostgreSQL instance
2. Copy Internal Database URL
3. Paste as `DATABASE_URL` in backend environment variables

---

## Phase 4: Deploy Frontend to Vercel (20 minutes)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### Step 2: Import Project

1. Dashboard → Add New → Project
2. Select your GitHub repo
3. **Root Directory**: `frontend`
4. Click Deploy

### Step 3: Add Environment Variables

1. Project Settings → Environment Variables
2. Add:
   ```
   VITE_BACKEND_URL=https://resumeai-backend.onrender.com
   ```

3. Redeploy with this command:
   ```bash
   npm run build
   ```

4. Your frontend URL will be: `https://[project-name].vercel.app`

---

## Phase 5: Connect Everything (10 minutes)

### Step 1: Update Backend FRONTEND_URL
1. Go to Render backend service settings
2. Update `FRONTEND_URL` to your Vercel URL
3. Redeploy

### Step 2: Test the Connection
1. Visit your frontend URL
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try AI generation
5. Check if requests go to backend

### Step 3: Verify Payment Flow
1. Select a resume
2. Click Download (should ask for payment)
3. Select payment method
4. Check if it connects to Campay demo

---

## Deployment Status Checklist

### Before Deployment ✓
- [ ] Local testing complete
- [ ] Database migrations tested locally
- [ ] API keys gathered
- [ ] GitHub repo ready

### During Deployment
- [ ] Render PostgreSQL created ✓
- [ ] Backend code updated to use PostgreSQL ✓
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Domains connected

### After Deployment
- [ ] Test frontend loads
- [ ] Test AI generation works
- [ ] Test payment flow
- [ ] Check error logs
- [ ] Monitor for 24 hours

---

## Troubleshooting Deployment

### Frontend not loading?
- Check browser console (F12) for errors
- Verify `VITE_BACKEND_URL` is correct
- Check Vercel deployment logs

### Backend API not responding?
- Check Render service status
- Verify environment variables are set
- Check Render logs for errors
- Ensure DATABASE_URL is correct

### Database connection failed?
- Verify DATABASE_URL format
- Check PostgreSQL service is running
- Ensure IP allowlist is configured (if needed)
- Test connection locally first

### Payment not working?
- Verify CAMPAY_APP_USER and CAMPAY_APP_PASSWORD
- Check if using demo endpoint (https://demo.campay.net/api)
- Test with Cameroon phone number
- Check Campay API status

---

## Post-Deployment: Monitor Everything

### First 24 Hours
- Monitor error logs
- Test all features manually
- Check payment transactions
- Monitor API response times
- Look for database connection issues

### Daily
- Check transaction success rate
- Review error logs
- Monitor uptime
- Verify backups running

### Weekly
- Security audit
- Performance review
- Database optimization
- Cost analysis

---

## Production Optimization Tips

1. **Enable Caching**: Render free tier might be slow - consider paid
2. **Monitor Costs**: PostgreSQL + Render + Vercel = ~$10-30/month
3. **Set Up Backups**: Configure daily PostgreSQL backups
4. **Enable Monitoring**: Add Sentry for error tracking
5. **Use CDN**: Vercel handles this automatically

---

## Next Steps

1. Create Render PostgreSQL database ✓
2. Update backend to use PostgreSQL ✓
3. Deploy backend to Render ✓
4. Deploy frontend to Vercel ✓
5. Test everything ✓
6. Monitor for 24 hours ✓

Ready to start? Jump to **Phase 1** above!
