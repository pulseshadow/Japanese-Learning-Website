# Deployment Guide - Git Integration with Netlify

## 🚀 Quick Setup Guide

### Step 1: Initialize Git Repository
```bash
# Navigate to your project folder
cd "path/to/your/japanese-learning-website"

# Initialize Git repository
git init

# Add all files to Git
git add .

# Make your first commit
git commit -m "Initial commit - Japanese Learning Website"
```

### Step 2: Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it: `japanese-learning-website`
4. Make it **Public** (required for free Netlify)
5. **Don't** initialize with README (you already have one)
6. Click "Create repository"

### Step 3: Connect to GitHub
```bash
# Add GitHub as remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/japanese-learning-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Deploy on Netlify
1. Go to [Netlify.com](https://netlify.com)
2. Click "Sign up" (use GitHub account)
3. Click "New site from Git"
4. Choose "GitHub"
5. Select your `japanese-learning-website` repository
6. Click "Deploy site"

### Step 5: Configure Auto-Deploy
1. In Netlify dashboard, go to "Site settings"
2. Under "Build & deploy" → "Deploy contexts"
3. Ensure "Deploy previews" and "Branch deploys" are enabled
4. Your site will now auto-deploy on every push!

## 🔄 Making Updates

### After making changes to your files:
```bash
# Add your changes
git add .

# Commit with a descriptive message
git commit -m "Added new feature: improved game mechanics"

# Push to GitHub (triggers auto-deploy)
git push origin main
```

### Your changes will be live in 1-2 minutes!

## 📁 Project Structure
```
japanese-learning-website/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript game logic
├── README.md           # Project documentation
├── .gitignore          # Git ignore rules
└── DEPLOYMENT.md       # This file
```

## 🌐 Custom Domain (Optional)
1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain (e.g., `japaneselearning.com`)
4. Follow DNS setup instructions

## 📊 Analytics Setup
1. Go to [Google Analytics](https://analytics.google.com)
2. Create new property for your site
3. Add tracking code to `index.html` before `</head>`

## 💰 AdSense Setup
1. Go to [Google AdSense](https://adsense.google.com)
2. Apply with your live Netlify URL
3. Wait for approval (1-2 weeks)
4. Add ad code to your site

## 🛠️ Troubleshooting

### If Git push fails:
```bash
# Pull latest changes first
git pull origin main

# Then push your changes
git push origin main
```

### If Netlify deploy fails:
1. Check Netlify build logs
2. Ensure all files are committed to Git
3. Verify file paths are correct

### Need to rollback?
1. In Netlify dashboard, go to "Deploys"
2. Find the working version
3. Click "Publish deploy"

## 📞 Support
- **GitHub Issues**: For code problems
- **Netlify Support**: For deployment issues
- **Google AdSense**: For ad-related questions

---

**Your website will now automatically update every time you push changes to GitHub! 🎉**

