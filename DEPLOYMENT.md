# Deployment Guide - Vercel

This guide will help you deploy the Real-Time Order Book Visualizer to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier works perfectly)
- A [GitHub account](https://github.com/signup)

## Method 1: Deploy via GitHub (Recommended)

This is the easiest method and enables automatic deployments on every push.

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `orderbook-visualizer`)
3. Make it public or private (both work with Vercel)
4. **Do NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Step 2: Push Your Code to GitHub

Run these commands in your terminal (replace `YOUR_USERNAME` with your GitHub username):

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR_USERNAME/orderbook-visualizer.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

That's it! Vercel will build and deploy your app. It takes about 1-2 minutes.

### Step 4: Access Your Live App

Once deployed, Vercel will give you a URL like:
```
https://orderbook-visualizer-xxxxx.vercel.app
```

You can also set up a custom domain in the Vercel dashboard.

---

## Method 2: Deploy via Vercel CLI (Alternative)

If you prefer using the command line:

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

The CLI will guide you through the setup. Just accept the defaults for a Next.js project.

---

## Configuration

### Build Settings (Auto-detected)

Vercel automatically detects these settings for Next.js:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

You don't need to configure anything - it just works!

### Environment Variables (Optional)

This project doesn't require any environment variables, but if you want to customize the trading pair or other settings in the future, you can add them in:

Vercel Dashboard → Your Project → Settings → Environment Variables

---

## Post-Deployment

### Automatic Deployments

If you deployed via GitHub:
- Every push to `main` branch triggers a production deployment
- Pull requests get preview deployments
- You can see deployment status in the Vercel dashboard

### Monitoring

Check your app's performance:
- Vercel Dashboard → Your Project → Analytics
- View real-time errors, performance metrics, and visitor stats

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow the DNS configuration instructions

---

## Troubleshooting

### Build Fails

- Check the build logs in the Vercel dashboard
- Make sure all dependencies are in `package.json`
- Try building locally first: `npm run build`

### App Works Locally But Not on Vercel

- Check browser console for errors
- Verify WebSocket connections aren't blocked
- Check that you're using `'use client'` directive in client components

### Rate Limit Issues

The app handles Binance API rate limits gracefully:
- It will show a yellow warning if rate-limited
- The order book will build from WebSocket deltas only
- This is normal behavior, not an error

---

## Performance Tips

Your app on Vercel will have:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Edge caching
- ✅ Automatic compression
- ✅ Image optimization
- ✅ Zero-config deployment

The free tier is perfect for this project and can handle thousands of visitors.

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

## What's Next?

After deployment, you might want to:

1. **Share your demo**: Copy the Vercel URL and share it
2. **Monitor usage**: Check Vercel Analytics
3. **Add custom features**:
   - Multiple trading pairs
   - Dark/light theme toggle
   - Historical data charts
   - Price alerts
4. **Custom domain**: Add your own domain name

Enjoy your live order book visualizer! 🚀
