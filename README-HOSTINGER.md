# 🚀 Hostinger Deployment Guide (Next.js + Prisma)

This guide takes the local project you've developed and deploys it onto your Hostinger environment. Since we added `output: "standalone"` and a `postinstall` script, the application is primed for a smooth release.

## 🛠 Prerequisites

1. Your Hostinger server (VPS or Web Hosting Node.js environment) must run **Node.js 20+**.
2. Your PostgreSQL server must be configured to allow external connections (or if it's hosted on Hostinger natively, just use the correct internal DB credentials).
3. Do **NOT** upload your `.env` directly via Git. Use Hostinger's environment variables dashboard or upload it manually via File Manager to keep `AUTH_SECRET` and `DATABASE_URL` secure.

---

## 🌎 Method A: Git Deployment (Recommended for Hostinger Web/Cloud Hosting)

Using Hostinger's built-in Git deployment is the most robust way because it natively handles compiling Prisma for the correct Linux binary.

1. **Commit and Push:** Push your current `c:\atgv\content_project` codebase to a private GitHub repository.
2. **Connect to Hostinger:** In your hPanel, go to **Advanced > GIT** or your Node.js app setup. Connect your GitHub repository.
3. **Set Environment Variables:** Add your `DATABASE_URL` and `AUTH_SECRET` inside the App's configuration panel and click save.
4. **Deploy / Build:** 
   Hostinger will automatically run `npm install`. Because we added `"postinstall": "prisma generate"`, the Linux-compatible Prisma Client is automatically built!
   Then, set the startup command to:
   ```bash
   npm run build && node .next/standalone/server.js
   ```
   *(Note: Depending on hPanel specifics, you might just point the startup file to `.next/standalone/server.js` after building).*

---

## 📦 Method B: Manual File Upload (For cPanel/hPanel File Manager)

If you prefer uploading via ZIP because you don't use Git:

1. On your Windows machine, run `npm run build`. This creates the `.next` folder.
2. Inside your project, create a ZIP file containing ONLY the following:
   *   `.next/standalone/` (all contents inside it)
   *   `public/` 
   *   `.next/static/`
   *   `package.json`
   *   `prisma/`
   *   `.env`
3. Upload the ZIP to your Hostinger File Manager in your `public_html` or designated Node.js app folder and extract it.
4. **Crucial Prisma Step:** Using Hostinger's SSH or terminal, navigate to the extracted folder and run:
   ```bash
   npm install
   ```
   *(This step downloads the required Linux query engine for Prisma. If you skip this, Prisma will crash because it expects a Windows engine!)*
5. Tell Hostinger's Node.js App container that the Application Startup File is `server.js` (found inside the standalone directory).

---

## 🔧 Method C: VPS (Virtual Private Server) Setup

If you have a full Hostinger VPS:

1. SSH into the server and clone your code.
2. Create `.env` manually.
3. Run `npm install` (this triggers `prisma generate` natively).
4. Run `npm run build`.
5. Install PM2: `npm install -g pm2`
6. Start the standalone server:
   ```bash
   cd .next/standalone
   pm2 start server.js --name "content_project"
   ```
7. Configure a Reverse Proxy (Nginx/Caddy) to point domain port 80/443 to `localhost:3000`.

---

**That's it!** The Next.js 16 standalone compilation minimizes server overhead, resulting in blistering fast loads for your application!
