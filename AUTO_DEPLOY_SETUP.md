# Automatic Deployment Setup

Your app is configured to automatically deploy on every push to GitHub using Vercel's GitHub integration.

## How It Works

```
git push origin main
    ↓
Vercel detects the push (via GitHub integration)
    ↓
Runs: npx convex deploy --cmd 'vite build'
    ↓
    ├─→ Deploys Convex backend
    │   └─→ Generates convex/_generated/api files
    │
    └─→ Builds frontend with Vite
        └─→ Uses the generated Convex files
    ↓
Deploys to production
    ↓
✅ Live at: yourproject.vercel.app
```

---

## One-Time Setup

### Step 1: Get Your Convex Deploy Key

1. Go to: https://dashboard.convex.dev
2. Select your project: `fleet-chickadee-379`
3. Click **Settings** → **Deploy Keys**
4. Click **Generate a deploy key** (if needed)
5. Copy the key (starts with `prod:...`)

### Step 2: Add Deploy Key to Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
   - **Name:** `CONVEX_DEPLOY_KEY`
   - **Value:** Paste your deploy key
   - **Environments:** Check all (Production, Preview, Development)
5. Click **Save**

### Step 3: Redeploy

Trigger a new deployment:

```bash
git commit --allow-empty -m "Configure auto-deploy"
git push origin main
```

Or click **Redeploy** in your Vercel dashboard.

---

## ✅ That's It!

From now on, every push to `main` automatically:
- ✅ Deploys your Convex backend
- ✅ Builds your frontend
- ✅ Deploys to production

**No manual deployments needed!** 🚀

---

## Verifying It Works

After pushing, check:
1. **Vercel Dashboard** - See deployment status
2. **Deployment Logs** - Verify Convex deploys, then Vite builds
3. **Your App** - Visit your Vercel URL to test

---

## Local Development

Nothing changes for local development:

```bash
# Run dev server
npm run dev

# Build locally (no deployment)
npm run build:local

# Deploy Convex only
npm run deploy:backend

# Manual full deployment
./deploy.sh      # First time
./redeploy.sh    # Subsequent times
```

---

## Troubleshooting

### Build fails with "Could not resolve convex/_generated/api"

**Cause:** Vercel doesn't have the `CONVEX_DEPLOY_KEY` environment variable.

**Fix:**
1. Add `CONVEX_DEPLOY_KEY` to Vercel (see Step 2 above)
2. Make sure it's enabled for "Production" environment
3. Redeploy

### Build fails with "Invalid deploy key"

**Fix:**
1. Generate a new deploy key in Convex Dashboard
2. Update the `CONVEX_DEPLOY_KEY` in Vercel
3. Redeploy

### App works but shows old data

**Check:**
1. Did Convex actually deploy? Check the build logs in Vercel
2. Is your app pointing to the right Convex URL?
3. Check Convex dashboard for the latest deployment

---

## What Changed

The key changes that enable auto-deployment:

### `vercel.json`
```json
{
  "buildCommand": "npx convex deploy --cmd 'vite build' --cmd-url-env-var-name VITE_CONVEX_URL"
}
```

This tells Vercel to deploy Convex before building the frontend.

### `package.json`
```json
{
  "scripts": {
    "build": "npx convex deploy --cmd 'vite build' --cmd-url-env-var-name VITE_CONVEX_URL",
    "build:local": "vite build"
  }
}
```

- `npm run build` - Deploys Convex + builds (used by Vercel)
- `npm run build:local` - Just builds frontend (for local testing)

---

## Configuration Files

All configuration is in:
- **`vercel.json`** - Vercel build settings
- **Vercel Dashboard** - Environment variables
- **Convex Dashboard** - Deploy keys

No GitHub Actions needed! Vercel handles everything.

---

## Security

- ✅ `CONVEX_DEPLOY_KEY` is stored securely in Vercel
- ✅ Never committed to Git
- ✅ Rotate periodically for security

---

## Questions?

- **Where are my deployment logs?** Vercel Dashboard → Your Project → Deployments → Click deployment → View Logs
- **How do I deploy to preview?** Open a Pull Request - Vercel auto-creates a preview
- **Can I disable auto-deploy?** Yes, in Vercel project settings → Git → Disconnect repository
- **Manual deployment?** Use `./redeploy.sh` or `npm run deploy:backend` + `npm run deploy:frontend`

