# Deployment Guide for Adhyatma Vidya

This guide covers deploying your Vedantic learning app to various free hosting platforms.

## 🚀 Option 1: Full-Stack Deployment (Recommended)

### Railway (Free Tier) - Best for Full-Stack
Railway provides $5/month free credits (enough for small apps).

#### Setup:
1. **Create Railway Account**: Go to [railway.app](https://railway.app)
2. **Connect GitHub**: Link your repository
3. **Deploy from GitHub**:
   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

4. **Railway Configuration**:
   - Create `railway.toml` in project root:
   ```toml
   [build]
   builder = "nixpacks"
   
   [deploy]
   startCommand = "npm start"
   
   [env]
   NODE_ENV = "production"
   PORT = "3000"
   ```

5. **Environment Variables** (in Railway dashboard):
   ```
   FLASHCARDS_SHEET_URL=your_google_sheets_csv_url
   QUIZ_SHEET_URL=your_quiz_sheets_csv_url
   NODE_ENV=production
   ```

6. **Deploy**: Railway will auto-deploy from your GitHub repo

### Render (Free Tier) - Alternative Full-Stack
Render offers free tier with some limitations.

#### Setup:
1. **Create Account**: Go to [render.com](https://render.com)
2. **New Web Service**: Connect your GitHub repo
3. **Configuration**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node.js
   - **Plan**: Free tier

4. **Environment Variables**:
   ```
   FLASHCARDS_SHEET_URL=your_google_sheets_csv_url
   QUIZ_SHEET_URL=your_quiz_sheets_csv_url
   NODE_ENV=production
   ```

## 🌐 Option 2: Frontend-Only Deployment

If you want to deploy just the frontend (you'll need to modify the app to work without backend):

### Netlify (Free)
Perfect for static sites with some serverless functions.

#### Prepare Frontend-Only Version:
1. **Create Static Version**:
   ```bash
   mkdir adhyatma-static
   cp index.html adhyatma-static/
   cp -r assets adhyatma-static/
   ```

2. **Modify for Static Deployment**:
   - Remove backend API calls
   - Use local storage for all data
   - Include sample data in JavaScript files

#### Deploy to Netlify:
1. **Create Account**: Go to [netlify.com](https://netlify.com)
2. **Drag & Drop**: Upload your `adhyatma-static` folder
3. **Custom Domain**: Available on free tier

### Vercel (Free)
Great for static sites and serverless functions.

#### Setup:
1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd adhyatma-static
   vercel
   ```

3. **Follow prompts** for configuration

### GitHub Pages (Free)
Simple static hosting directly from GitHub.

#### Setup:
1. **Create `gh-pages` branch**:
   ```bash
   git checkout -b gh-pages
   # Copy your static files to root
   cp index.html .
   cp -r assets .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

2. **Enable GitHub Pages**:
   - Go to repo Settings > Pages
   - Select `gh-pages` branch
   - Your site will be at: `https://yourusername.github.io/repositoryname`

## 🔧 Recommended Approach: Railway Deployment

Here's the complete setup for Railway (best option):

### 1. Prepare Your Repository

Create these files in your project root:

**package.json** (ensure these scripts exist):
```json
{
  "scripts": {
    "start": "node server/server.js",
    "dev": "nodemon server/server.js",
    "build": "echo 'No build step required'",
    "postinstall": "echo 'Dependencies installed'"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

**railway.toml**:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "never"

[env]
NODE_ENV = "production"
```

**.gitignore** (add if not exists):
```
node_modules/
.env
database.db
*.log
.DS_Store
```

### 2. Environment Variables for Production

Create a `.env.example` file:
```bash
# Google Sheets CSV URLs (required for content)
FLASHCARDS_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
QUIZ_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_QUIZ_ID/export?format=csv&gid=0

# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration (optional)
DB_PATH=./server/database.db
```

### 3. Deploy to Railway

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment 🚀"
   git push origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect Node.js and deploy

3. **Add Environment Variables**:
   - Go to your project dashboard
   - Click "Variables" tab
   - Add your Google Sheets URLs
   - Add any other environment variables

4. **Custom Domain** (Optional):
   - Railway provides a free domain: `yourapp.railway.app`
   - You can add custom domain in Settings

### 4. Verify Deployment

After deployment, test these endpoints:
- `https://yourapp.railway.app/` - Main app
- `https://yourapp.railway.app/api/health` - Health check
- `https://yourapp.railway.app/api/stats` - App statistics

## 📊 Hosting Comparison

| Platform | Type | Free Tier | Custom Domain | Database | Best For |
|----------|------|-----------|---------------|----------|----------|
| **Railway** | Full-Stack | $5/month credits | ✅ | ✅ SQLite | **Recommended** |
| **Render** | Full-Stack | 750 hours/month | ✅ | ✅ SQLite | Full-Stack Alternative |
| **Netlify** | Static/Serverless | Unlimited | ✅ | ❌ | Frontend + Functions |
| **Vercel** | Static/Serverless | Unlimited | ✅ | ❌ | Frontend + Edge |
| **GitHub Pages** | Static Only | Unlimited | ✅ | ❌ | Simple Static |

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Node.js version in `engines` field
   - Ensure all dependencies are in `package.json`
   - Check for missing environment variables

2. **Database Issues**:
   - SQLite files are ephemeral on some platforms
   - Consider upgrading to persistent storage
   - Check file permissions

3. **Google Sheets Access**:
   - Ensure sheets are published publicly
   - Check CSV export URLs are correct
   - Test URLs directly in browser

4. **API Errors**:
   - Check health endpoint: `/api/health`
   - Verify environment variables are set
   - Check server logs in platform dashboard

### Debug Commands:
```bash
# Test locally first
npm start
curl http://localhost:3000/api/health

# Check Google Sheets URLs
curl "YOUR_GOOGLE_SHEETS_URL"
```

## 🌟 Next Steps

After successful deployment:

1. **Update Google Sheets** with your content
2. **Test all features** on the live site
3. **Share your app** with seekers of Vedantic wisdom
4. **Monitor usage** through platform analytics
5. **Consider upgrading** to paid plans for more resources

Your divine Vedantic learning platform will now be accessible to seekers worldwide! 🕉️

---

**Om Shanti Shanti Shanti** 🙏

*May your digital ashram spread wisdom and peace to all who seek the path of self-realization.*