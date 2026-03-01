# Paisa Pal – Hosting Walkthrough

Step-by-step guide to host your Paisa Pal expense tracker app online. The app is a static-friendly Next.js app that works great on **Vercel** (recommended), **Netlify**, or any Node.js hosting.

---

## Prerequisites

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) or [Netlify](https://netlify.com) account (both have free tiers)

---

## Option 1: Vercel (Recommended)

Vercel is made by the Next.js team and offers the smoothest deployment experience.

### Step 1: Push your code to GitHub

1. Create a new repository on GitHub (e.g. `paisa-pal`).
2. In your project folder, run:

```bash
cd /Users/karan/Desktop/projects/expense-Tracker
git init
git add .
git commit -m "Initial commit - Paisa Pal expense tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use “Continue with GitHub”).
2. Click **“Add New…”** → **“Project”**.
3. Import your GitHub repository (e.g. `paisa-pal`).
4. Vercel will auto-detect Next.js. Keep the default settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build` (or leave default)
   - **Output Directory:** (leave default)
5. Click **“Deploy”**.
6. Wait 1–2 minutes. When it’s done, you’ll get a URL like `https://paisa-pal-xxx.vercel.app`.

### Step 3: Access your app

- Open the provided URL in your browser.
- The app runs entirely in the browser; data is stored in `localStorage` on the user’s device.
- No backend or database setup is required.

### Custom domain (optional)

1. In your Vercel project, go to **Settings** → **Domains**.
2. Add your domain (e.g. `paisapal.app`).
3. Follow the DNS instructions Vercel gives you.

---

## Option 2: Netlify

### Step 1: Push to GitHub

Same as Vercel: push your project to a GitHub repository.

### Step 2: Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub.
2. Click **“Add new site”** → **“Import an existing project”**.
3. Choose **GitHub** and select your repository.
4. Configure the build:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next` (Netlify may suggest this for Next.js)
   - For Next.js on Netlify, you typically use the **Next.js runtime**.
5. Click **“Deploy site”**.

### Step 3: Next.js on Netlify

Netlify supports Next.js via the [Essential Next.js plugin](https://docs.netlify.com/frameworks/next-js/). If the plugin is enabled, Netlify will handle the build and routing automatically.

---

## Option 3: Manual build and static export (advanced)

If you want to host on a simple static host (e.g. GitHub Pages, S3, or any static hosting):

1. Add a static export to `next.config.ts`:

```ts
const nextConfig = {
  output: "export",
};
```

2. Build:

```bash
npm run build
```

3. Upload the contents of the `out` folder to your static host.

**Note:** Some features (e.g. client-side routing) may behave differently with static export. Vercel or Netlify are usually easier for full Next.js apps.

---

## Post-deployment checklist

- [ ] App loads at your deployment URL
- [ ] Add expense works
- [ ] Totals update correctly
- [ ] Categories and Insights load
- [ ] Budget page saves settings
- [ ] Data persists after refresh (localStorage)

---

## Troubleshooting

### Build fails

- Run `npm run build` locally and fix any errors.
- Ensure all dependencies are in `package.json` and `npm install` runs without errors.

### Blank page or 404

- Check the browser console for errors.
- Confirm the deployment URL is correct.
- For Netlify, ensure the Next.js plugin is enabled.

### Data not persisting

- Data is stored in `localStorage` per device/browser.
- Clearing site data or using a different browser/device will reset data.
- This is expected; there is no server-side storage.

---

## Summary

| Platform | Difficulty | Best for |
|----------|------------|----------|
| **Vercel** | Easy | Next.js, automatic deploys, free tier |
| **Netlify** | Easy | Static/Next.js, free tier |
| **Static export** | Medium | Simple static hosts |

For most users, **Vercel** is the simplest and most reliable option.
