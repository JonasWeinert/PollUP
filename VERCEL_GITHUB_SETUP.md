# Vercel + GitHub CI/CD Setup Guide

Since you've already created a Vercel project from the GitHub dashboard, this guide will help you configure it properly to deploy both Convex and your frontend automatically.

## The Problem You're Seeing

The build is failing because:
1. Vercel tries to build your frontend
2. The frontend imports from `convex/_generated/api`
3. But those files don't exist yet because Convex hasn't been deployed

**Solution:** Configure Vercel to deploy Convex BEFORE building the frontend.

---

## ✅ Step 1: Add Convex Deploy Key to Vercel

1. **Get your Convex Deploy Key:**
   - Go to: https://dashboard.convex.dev
   - Select your project: `fleet-chickadee-379`
   - Go to **Settings** → **Deploy Keys**
   - Click **Generate a deploy key** (if you haven't already)
   - Copy the key (starts with `prod:...`)

2. **Add it to Vercel:**
   - Go to your Vercel project: https://vercel.com/dashboard
   - Click on your project
   - Go to **Settings** → **Environment Variables**
   - Click **Add New**
   - Name: `CONVEX_DEPLOY_KEY`
   - Value: Paste your deploy key from step 1
   - Select: **Production**, **Preview**, and **Development**
   - Click **Save**

---

## ✅ Step 2: Commit Updated Configuration

The `vercel.json` and `package.json` have been updated to deploy Convex during the build process.

Commit and push these changes:

```bash
git add vercel.json package.json .github/
git commit -m "Configure Vercel to deploy Convex during build"
git push origin main
```

---

## ✅ Step 3: Trigger Redeploy

After setting the environment variable, redeploy:

**Option A: Trigger via Vercel Dashboard**
1. Go to your Vercel project
2. Click **Deployments**
3. Click the **⋮** menu on the latest deployment
4. Click **Redeploy**

**Option B: Trigger via Git Push**
```bash
# Make a small change or use an empty commit
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

---

## 🎯 How It Works Now

When you push to GitHub:

```
git push origin main
    ↓
Vercel detects change (via GitHub integration)
    ↓
Runs build command: npx convex deploy --cmd 'vite build' --cmd-url-env-var-name VITE_CONVEX_URL
    ↓
    ├─→ Deploys Convex (generates convex/_generated/api files)
    │   └─→ Returns CONVEX_URL
    │
    └─→ Runs vite build (with VITE_CONVEX_URL set)
        └─→ Builds frontend successfully
    ↓
Vercel deploys the built frontend
    ↓
✅ Done!
```

---

## 📋 Required Environment Variables in Vercel

Make sure these are set in your Vercel project (Settings → Environment Variables):

| Variable Name | Value | Where to Get It |
|---------------|-------|-----------------|
| `CONVEX_DEPLOY_KEY` | `prod:...` | [Convex Dashboard](https://dashboard.convex.dev) → Settings → Deploy Keys |
| `VITE_CONVEX_URL` | Optional* | Auto-set during build or from Convex Dashboard |

\* `VITE_CONVEX_URL` is automatically set during the build process by the `--cmd-url-env-var-name` flag, but you can also set it manually if you want to override it.

---

## 🔍 Verify the Setup

### Check Build Command

In your Vercel project settings:
- Go to **Settings** → **General** → **Build & Development Settings**
- **Build Command** should be: `npx convex deploy --cmd 'vite build' --cmd-url-env-var-name VITE_CONVEX_URL`
- Or it should use the command from `vercel.json` (which we updated)

### Check Environment Variables

In your Vercel project settings:
- Go to **Settings** → **Environment Variables**
- Verify `CONVEX_DEPLOY_KEY` is set for Production, Preview, and Development

---

## 🐛 Troubleshooting

### Build still fails with "Could not resolve convex/_generated/api"

**Check:**
1. Is `CONVEX_DEPLOY_KEY` set in Vercel environment variables?
2. Is the deploy key valid? (Test it locally: `CONVEX_DEPLOY_KEY=prod:... npx convex deploy`)
3. Did you redeploy after adding the environment variable?

**Solution:**
- Verify the deploy key is correct
- Make sure it's set for "Production" environment
- Trigger a new deployment

### "Invalid deploy key" error

**Solution:**
- Go to Convex Dashboard → Settings → Deploy Keys
- Generate a new deploy key
- Update it in Vercel environment variables
- Redeploy

### Build succeeds but app doesn't work

**Check:**
1. Are both Convex and Vercel deployed?
2. Check Vercel logs: Click on deployment → View Function Logs
3. Check Convex dashboard for any errors

---

## 📚 What Changed in Your Files

### `vercel.json`
```json
{
  "buildCommand": "npx convex deploy --cmd 'vite build' --cmd-url-env-var-name VITE_CONVEX_URL",
  ...
}
```
- Now deploys Convex BEFORE building frontend

### `package.json`
```json
{
  "scripts": {
    "build": "npx convex deploy --cmd 'vite build' --cmd-url-env-var-name VITE_CONVEX_URL",
    "build:local": "vite build",
    ...
  }
}
```
- `npm run build` now deploys Convex + builds frontend
- `npm run build:local` for local builds only (no Convex deploy)

### `.github/workflows/deploy.yml`
- Simplified workflow
- Vercel GitHub integration handles all deployments
- GitHub Actions just provides deployment status info

---

## 🎉 Success!

Once configured, every push to `main` will:
1. ✅ Trigger Vercel deployment (via GitHub integration)
2. ✅ Vercel deploys Convex backend (using your deploy key)
3. ✅ Vercel builds frontend (with generated Convex files)
4. ✅ Vercel deploys everything to production

**No manual deployments needed!** 🚀

---

## 💡 Local Development

For local development, nothing changes:

```bash
# Run dev server (frontend + backend)
npm run dev

# Build locally (frontend only, no Convex deploy)
npm run build:local

# Deploy Convex only
npm run deploy:backend
```

---

## 🔐 Security Note

- Never commit `CONVEX_DEPLOY_KEY` to your repository
- Store it only in Vercel environment variables
- Rotate the key periodically for security

---

## Next Steps

1. ✅ Add `CONVEX_DEPLOY_KEY` to Vercel (Step 1 above)
2. ✅ Commit and push the updated files (Step 2 above)
3. ✅ Watch your deployment succeed in Vercel dashboard!

Your app will be live at: `https://your-project.vercel.app`

