# TeachingTools Interactive Classroom App
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
 You can find docs about Chef with useful information like how to deploy to production [here](https://docs.convex.dev/chef).
  
This project is connected to the Convex deployment named [`fleet-chickadee-379`](https://dashboard.convex.dev/d/fleet-chickadee-379).
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

### Development

Run the development server:
```bash
npm run dev
```

This starts both the frontend (Vite) and backend (Convex) in development mode.

### Deployment Options

#### Option 1: GitHub CI/CD (Recommended) 🚀

Automatic deployments on every push to `main`:

1. **Quick Setup:**
   ```bash
   ./setup-github-cicd.sh
   ```

2. **Add GitHub Secrets:**
   - Go to Repository → Settings → Secrets and variables → Actions
   - Add: `CONVEX_DEPLOY_KEY`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

3. **Push to Deploy:**
   ```bash
   git push origin main
   ```

📖 **Full guide:** [GITHUB_CI_CD_SETUP.md](./GITHUB_CI_CD_SETUP.md)  
⚡ **Quick reference:** [QUICK_CICD_REFERENCE.md](./QUICK_CICD_REFERENCE.md)

#### Option 2: Manual Deployment

First-time deployment:
```bash
./deploy.sh
```

Quick redeployment:
```bash
./redeploy.sh
```

Or deploy individually:
```bash
npm run deploy:backend   # Convex only
npm run deploy:frontend  # Vercel only
```

📖 **Full guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

### Additional Resources

Check out the [Convex docs](https://docs.convex.dev/) for more information:
* [Overview](https://docs.convex.dev/understanding/) - Getting started with Convex
* [Hosting and Deployment](https://docs.convex.dev/production/) - Production deployment guide
* [Best Practices](https://docs.convex.dev/understanding/best-practices/) - Tips for improving your app

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.
