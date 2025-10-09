# Quick Start - Fix Your Deployment

Your Vercel build is failing because it can't find the Convex generated files. Here's the fix:

## 🚨 Fix Right Now (2 steps)

### Step 1: Add Convex Deploy Key to Vercel

1. **Get your deploy key:**
   - Go to: https://dashboard.convex.dev
   - Select project: `fleet-chickadee-379`
   - Click: **Settings** → **Deploy Keys** → **Generate**
   - Copy the key (starts with `prod:...`)

2. **Add to Vercel:**
   - Go to: https://vercel.com/dashboard
   - Select your project
   - **Settings** → **Environment Variables** → **Add New**
   - Name: `CONVEX_DEPLOY_KEY`
   - Value: Paste the key
   - Check: Production, Preview, Development
   - Click: **Save**

### Step 2: Commit & Push

```bash
git add vercel.json package.json README.md AUTO_DEPLOY_SETUP.md
git commit -m "Fix Vercel deployment to include Convex"
git push origin main
```

## ✅ Done!

Vercel will now:
1. Deploy Convex (generates the missing files)
2. Build your frontend (with the generated files)
3. Deploy everything

Watch it work: https://vercel.com/dashboard → Your Project → Deployments

---

## What Changed?

**`vercel.json`** - Build command now deploys Convex first:
```json
"buildCommand": "npx convex deploy --cmd 'vite build' --cmd-url-env-var-name VITE_CONVEX_URL"
```

This fixes the "Could not resolve convex/_generated/api" error.

---

## Going Forward

Every push to `main` automatically deploys both Convex and Vercel.

No GitHub Actions. No manual deployments. Just push and deploy. 🚀

---

**Full guide:** [AUTO_DEPLOY_SETUP.md](./AUTO_DEPLOY_SETUP.md)

