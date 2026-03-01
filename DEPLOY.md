# Paisa Pal – GitHub & Hosting Guide

Step-by-step process to create a GitHub repo and host Paisa Pal. Use your **personal GitHub account** for this project.

---

## Part 1: Create GitHub Repository

### 1. Create the repo on GitHub

1. Go to [github.com](https://github.com) and sign in with your **personal account**
2. Click the **+** icon (top right) → **New repository**
3. Fill in:
   - **Repository name:** `paisa-pal` (or `paisa-pal-expense-tracker`)
   - **Description:** Mobile-first expense tracker with budgets, coins & cashback
   - **Visibility:** Public (or Private)
   - **Do NOT** check "Add a README" (you already have one)
4. Click **Create repository**

### 2. Push your code

Open Terminal and run:

```bash
cd /Users/karan/Desktop/projects/expense-Tracker

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Paisa Pal expense tracker"

# Rename branch to main (if needed)
git branch -M main

# Add your GitHub repo as remote (replace YOUR_USERNAME with your personal GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/paisa-pal.git

# Push to GitHub
git push -u origin main
```

**If you already have a remote configured** (e.g. from a different account), remove it first:
```bash
git remote remove origin
```
Then add your personal repo and push as above.

**Example:** If your personal GitHub username is `karan`, the URL would be:
```
https://github.com/karan/paisa-pal.git
```

---

## Part 2: Host on Vercel (Recommended)

### 1. Sign up / Log in

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** or **Log In**
3. Choose **Continue with GitHub**

### 2. Import the project

1. Click **Add New…** → **Project**
2. Find **paisa-pal** in the list (or search for it)
3. Click **Import** next to it

### 3. Deploy

1. Vercel will auto-detect Next.js – keep the defaults
2. Click **Deploy**
3. Wait 1–2 minutes

### 4. Access your app

- You’ll get a URL like `https://paisa-pal-xxx.vercel.app`
- Open it in your browser
- Data is stored in the browser (localStorage) – no backend needed

---

## Part 3: Future Updates

When you change the code and want to redeploy:

```bash
git add .
git commit -m "Your commit message"
git push
```

Vercel will automatically redeploy when you push to GitHub.

---

## Quick Checklist

- [ ] Create GitHub repo
- [ ] Push code to GitHub
- [ ] Sign in to Vercel with GitHub
- [ ] Import repo and deploy
- [ ] Open the live URL and test

---

## Troubleshooting

**"Repository not found"** – Check the remote URL and that the repo exists on GitHub.

**Build fails** – Run `npm run build` locally and fix any errors before pushing.

**Blank page** – Open DevTools (F12) → Console and check for errors.
