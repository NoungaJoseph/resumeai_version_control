# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

#### Backend (.env)
```env
PORT=3001
GEMINI_API_KEY=your_actual_api_key
CAMPAY_APP_USER=your_campay_username
CAMPAY_APP_PASSWORD=your_campay_password
FRONTEND_URL=https://your-frontend-domain.com
CAMPAY_BASE_URL=https://api.campay.net/api  # Use production endpoint, not demo
```

#### Frontend (.env.production)
```env
VITE_BACKEND_URL=https://your-backend-domain.com
```

### 2. Critical Changes for Production

#### Database Migration (URGENT)
The current backend uses `payments.json` which is:
- **Ephemeral** - lost on every container restart
- **Not scalable** - not suitable for production
- **No backup** - data loss risk

**Required Action:** Migrate to PostgreSQL or MongoDB before going live.

Example with PostgreSQL:
```bash
npm install pg
# Then update server.js to use proper database queries
```

#### API Keys & Security
- Never commit `.env` files to version control (already in .gitignore ✓)
- Use environment-specific configuration
- Rotate API keys regularly
- Store sensitive data in a secrets manager (AWS Secrets Manager, Vault, etc.)

#### CORS Configuration
Update `server.js` CORS with your actual domain:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Testing Before Deploy

- [ ] Test payment flow with real Cameroon phone numbers
- [ ] Verify webhook delivery (use ngrok for local testing)
- [ ] Test error scenarios (network failures, timeouts)
- [ ] Load test with concurrent users
- [ ] Verify PDF export works in all browsers
- [ ] Test file size limits for photo uploads (2MB max)

### 4. Monitoring & Logging

Add error tracking:
```bash
npm install @sentry/node
```

Example setup:
```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.errorHandler());
```

### 5. Deployment Platforms

#### Render.com (Recommended for Backend)
1. Connect your GitHub repo
2. Create new Web Service
3. Set environment variables in dashboard
4. Add build command: `npm install`
5. Add start command: `npm start`
6. **Important:** Use PostgreSQL add-on, not filesystem

#### Vercel (Recommended for Frontend)
1. Connect your GitHub repo
2. Set `VITE_BACKEND_URL` environment variable
3. Deploy from `frontend` directory

### 6. Production Checklist

- [ ] Database set up and tested
- [ ] All environment variables configured
- [ ] CORS origins updated
- [ ] API keys rotated and secured
- [ ] Error logging/monitoring enabled
- [ ] HTTPS enabled on both frontend and backend
- [ ] Backup strategy in place
- [ ] Payment testing completed
- [ ] Rate limiting implemented (optional but recommended)

### 7. Post-Deployment

- Monitor error logs for the first 24 hours
- Track payment success/failure rates
- Monitor API response times
- Set up alerts for critical errors
- Plan regular security audits
- Schedule database backups

## Troubleshooting

**Payment timeouts?**
- Check network connectivity
- Verify Campay API endpoint (demo vs production)
- Increase polling timeout if needed

**Missing transactions?**
- Enable webhook logging in backend
- Verify webhook URL is accessible
- Check Campay webhook configuration

**Database issues?**
- Verify connection string
- Check database credentials
- Monitor storage space
