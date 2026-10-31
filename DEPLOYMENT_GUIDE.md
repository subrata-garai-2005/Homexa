# 🚀 Homely_Hub (Homexa) - Cloudflare & AWS Deployment Guide

Yeh guide aapko Frontend ko **Cloudflare Pages** par aur Backend ko **AWS (App Runner ya EC2)** par smoothly deploy karne ka complete process step-by-step batati hai.

---

## 🏗️ Architecture Summary

* **Frontend**: React 19 + Vite SPA (Hosted on **Cloudflare Pages** - Free CDN, auto-SSL, instant builds)
* **Backend**: Node.js + Express API (Hosted on **AWS App Runner** or **AWS EC2**)
* **Database**: MongoDB Atlas
* **Storage & Payments**: ImageKit.io + Razorpay
* **DNS & Security**: Cloudflare DNS (SSL Full / Strict, DDoS protection)

---

## 1️⃣ STEP 1: Deploy Backend on AWS

### Option A: AWS App Runner (Sabse Aasan aur Best - No Linux Management)

Aapke repo me `Backend/apprunner.yaml` aur `Backend/Dockerfile` already set hai.

1. **GitHub par code push karein**:
   ```bash
   git add .
   git commit -m "Add Cloudflare and AWS deployment configs"
   git push origin main
   ```
2. **AWS Console** me login karein aur **AWS App Runner** search karein.
3. **Create an App Runner service** par click karein:
   * **Source**: `Source code repository` (GitHub account link karein).
   * **Repository**: `Homely_Hub`
   * **Branch**: `main`
   * **Source directory**: `/Backend`
   * **Deployment settings**: `Automatic`
4. **Configure build**:
   * Select karein: **Use a configuration file** (Yeh `apprunner.yaml` auto-detect kar lega).
5. **Configure service (Environment Variables)**:
   Add Environment Variables:
   * `NODE_ENV`: `production`
   * `PORT`: `5000`
   * `MONGO_URI`: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/homelyhub`
   * `JWT_SECRET`: `your_strong_jwt_secret_key`
   * `JWT_EXPIRE`: `7d`
   * `FRONTEND_URL`: `https://your-frontend.pages.dev` (ya aapka domain `https://yourdomain.com`)
   * `IMAGEKIT_PUBLIC_KEY`: `your_imagekit_public_key`
   * `IMAGEKIT_PRIVATE_KEY`: `your_imagekit_private_key`
   * `IMAGEKIT_URL_ENDPOINT`: `https://ik.imagekit.io/your_id`
   * `RAZORPAY_KEY_ID`: `rzp_live_...`
   * `RAZORPAY_KEY_SECRET`: `your_razorpay_secret`
   * `RAZORPAY_WEBHOOK_SECRET`: `your_webhook_secret`
   * `SMTP_HOST`: `smtp.gmail.com`
   * `SMTP_PORT`: `587`
   * `SMTP_USER`: `your_email@gmail.com`
   * `SMTP_PASS`: `your_app_password`
   * `EMAIL_FROM`: `Homely Hub <your_email@gmail.com>`
6. **Deploy**:
   * Click **Create & Deploy**.
   * 3-5 minute me aapka service **Running** ho jayega aur ek URL milega:
     `https://xxxxxxxxxx.awsapprunner.com`
7. **Test API**:
   Browser me visit karein: `https://xxxxxxxxxx.awsapprunner.com/api/health`
   Expected response:
   ```json
   {"success": true, "status": "healthy", "db": "connected"}
   ```

---

### Option B: AWS EC2 (Ubuntu Linux + PM2 + Nginx)

Agar aap Free Tier EC2 instance use kar rahe hain:

1. **EC2 Instance Launch karein**: Ubuntu 24.04 LTS (Security Group: Allow SSH 22, HTTP 80, HTTPS 443).
2. **Server par login karke tools install karein**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs git nginx
   sudo npm install -g pm2
   ```
3. **Repository Clone aur Start**:
   ```bash
   git clone <YOUR_REPO_URL>
   cd Homely_Hub/Backend
   npm install --omit=dev
   nano .env # (Env variables paste karein)
   pm2 start server.js --name "homely-backend"
   pm2 startup
   pm2 save
   ```
4. **Nginx Reverse Proxy Setup (`/etc/nginx/sites-available/default`)**:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com; # ya EC2 Public IP

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Save karein aur reload karein:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 2️⃣ STEP 2: Deploy Frontend on Cloudflare Pages

1. **Cloudflare Dashboard** me login karein (`dash.cloudflare.com`).
2. Left sidebar se **Workers & Pages** par click karein -> **Create Application** -> **Pages** -> **Connect to Git**.
3. Apna GitHub repo `Homely_Hub` select karein.
4. **Build settings set karein**:
   * **Framework preset**: `Vite`
   * **Root directory**: `Frontend`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
5. **Environment Variables**:
   * `VITE_API_URL`: `https://xxxxxxxxxx.awsapprunner.com/api` (Aapka AWS Backend URL jisme aage `/api` laga ho)
6. **Save and Deploy**:
   * Cloudflare aapka project build karega.
   * `Frontend/public/_redirects` already setup hai, isliye page refresh ya deep links par koi 404 error nahi aayega.
   * `Frontend/public/_headers` static assets ko CDN par fast cache karega.

---

## 3️⃣ STEP 3: Domain & Cloudflare DNS Setup (Optional Custom Domain)

Agar aapke paas domain hai (jaise `example.com`):

1. **Frontend connect karein**:
   * Cloudflare Pages me project select karein -> **Custom domains** tab -> `example.com` aur `www.example.com` add karein. Cloudflare automatically DNS config karega.
2. **Backend API connect karein (`api.example.com`)**:
   * **App Runner ke liye**: App Runner me "Custom domains" me `api.example.com` add karein aur diya gaya CNAME Cloudflare DNS me add karein.
   * **EC2 ke liye**: Cloudflare DNS me ek `A Record` banayein:
     * **Name**: `api`
     * **IPv4 address**: `YOUR_EC2_PUBLIC_IP`
     * **Proxy status**: `Proxied (Orange cloud)`
3. **Cloudflare SSL/TLS Settings**:
   * Cloudflare Dashboard > **SSL/TLS** > Encryption Mode: **Full** ya **Full (Strict)** select karein.
4. **Backend `.env` update karein**:
   * `FRONTEND_URL` ko `https://example.com` par update karein aur backend restart/redeploy karein.

---

## 4️⃣ Testing & Verification Checklist

- [ ] `/api/health` status returns `healthy` and `db: connected`.
- [ ] Frontend opens cleanly on the Cloudflare Pages URL.
- [ ] User Register & Login work (JWT token saved in localStorage).
- [ ] Refreshing on sub-pages (e.g. `/properties`) works without 404 (due to `_redirects`).
- [ ] Property listing and Image upload work (ImageKit integration).
- [ ] Razorpay checkout modal opens properly.
- [ ] Razorpay Webhook configured at `https://<YOUR_BACKEND_URL>/api/payments/webhook`.

