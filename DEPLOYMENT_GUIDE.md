# 🚀 Homely_Hub (Homexa) - 100% Cloudflare & Free Backend Deployment Guide

Yeh guide aapko **AWS se sab kuch safely delete karne** aur poora project **Cloudflare (Pages + Workers)** par smoothly deploy karne ka complete process step-by-step batati hai.

---

## 🏗️ New Architecture Summary (Zero AWS, Zero Bill)

* **Frontend**: React 19 + Vite SPA (Hosted on **Cloudflare Pages** - Free CDN, auto-SSL, instant builds)
* **API Proxy / Edge Functions**: **Cloudflare Pages Functions / Cloudflare Workers** (`worker.js` & `functions/api/`)
* **Backend**: Node.js + Express API (Hosted on **Render.com** or **Railway** - 100% Free tier, zero Linux maintenance)
* **Database**: MongoDB Atlas (Free M0 Cluster)
* **Storage & Payments**: ImageKit.io + Razorpay
* **DNS & Security**: Cloudflare DNS (SSL Full/Strict, DDoS Protection, Global Edge Caching)

---

## 🛑 STEP 1: AWS Deployment Delete / Terminate Karein (Billing Bachayein)

Aapka AWS EC2 instance ya App Runner delete karne ke liye:

### A. AWS EC2 Instance Terminate Karein:
1. **AWS Console** (`console.aws.amazon.com`) me login karein.
2. Search bar me **EC2** type karein aur **Instances** par click karein.
3. Apna Homely Hub instance (IP: `44.222.204.56` ya similar) select karein.
4. Top right me **Instance State** button par click karein -> **Terminate instance** select karein.
5. Confirm karein. Kuch hi minute me instance shut down aur permanently delete ho jayega.
6. **Elastic IP check karein**: Left sidebar me **Network & Security -> Elastic IPs** par jayein. Agar koi IP allocated hai, usse select karke **Actions -> Release Elastic IP addresses** kar dein (taaki koi unattached IP charge na lage).

### B. AWS App Runner Service Delete Karein (Agar banaya tha):
1. AWS Console me **App Runner** search karein.
2. Agar koi active service hai, uske name par click karein.
3. **Actions** menu par click karein -> **Delete service** confirm karein.

---

## 🌐 STEP 2: Deploy Backend (Node.js + MongoDB) on Render (100% Free)

Cloudflare Workers serverless V8 isolates par chalta hai jisme persistent MongoDB TCP connections directly run nahi hote. Isliye Node.js/Express backend ko **Render.com** (Free) par deploy karna sabse best aur clean solution hai:

1. **GitHub par changes push karein**:
   ```bash
   git add .
   git commit -m "Remove AWS configs and configure full Cloudflare deployment"
   git push origin main
   ```
2. [Render.com](https://render.com) par login karein (Sign in with GitHub).
3. Dashboard me **New +** button par click karein -> **Web Service** select karein.
4. Apna GitHub repository `Homely_Hub` select karein.
5. **Settings configure karein**:
   * **Name**: `homely-backend` (ya apni pasand ka name)
   * **Region**: Singapore / Frankfurt / Oregon (koi bhi select karein)
   * **Branch**: `main`
   * **Root Directory**: `Backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
   * **Instance Type**: `Free`
6. **Environment Variables** add karein:
   * `NODE_ENV`: `production`
   * `PORT`: `5000`
   * `MONGO_URI`: `mongodb+srv://...` (Aapka MongoDB Atlas connection string)
   * `JWT_SECRET`: (Aapka secret key)
   * `JWT_EXPIRE`: `7d`
   * `FRONTEND_URL`: `https://homexa.pages.dev` (ya aapka domain)
   * `IMAGEKIT_PUBLIC_KEY`: `your_imagekit_public_key`
   * `IMAGEKIT_PRIVATE_KEY`: `your_imagekit_private_key`
   * `IMAGEKIT_URL_ENDPOINT`: `https://ik.imagekit.io/...`
   * `RAZORPAY_KEY_ID`: `your_razorpay_key_id`
   * `RAZORPAY_KEY_SECRET`: `your_razorpay_key_secret`
   * `SMTP_HOST`: `sandbox.smtp.mailtrap.io` (ya Gmail)
   * `SMTP_PORT`: `587`
   * `SMTP_USER`: `your_user`
   * `SMTP_PASS`: `your_pass`
   * `EMAIL_FROM`: `Homely Hub <noreply@homelyhub.com>`
7. **Deploy Web Service** par click karein.
   * 2-3 minute me aapka backend live ho jayega aur ek URL milega:
     `https://homely-backend.onrender.com`
8. **Test API**:
   Browser me `https://homely-backend.onrender.com/api` open karein:
   Expected response:
   ```json
   { "success": true, "message": "🏡 Homexa API is running!" }
   ```

---

## ⚡ STEP 3: Deploy Frontend on Cloudflare Pages

1. **Cloudflare Dashboard** (`dash.cloudflare.com`) me login karein.
2. Left menu se **Workers & Pages** par click karein.
3. **Create application** -> **Pages** tab -> **Connect to Git** select karein.
4. Apna GitHub repository `Homely_Hub` select karein aur **Begin setup** par click karein.
5. **Build settings configure karein**:
   * **Project name**: `homexa` (ya apni pasand ka name)
   * **Production branch**: `main`
   * **Framework preset**: `Vite`
   * **Root directory**: `/` (ya `Frontend`)
     * *Agar Root directory `/` rakhte hain*:
       - **Build command**: `npm run build`
       - **Build output directory**: `dist`
     * *Agar Root directory `Frontend` rakhte hain*:
       - **Build command**: `npm run build`
       - **Build output directory**: `dist`
6. **Environment Variables (Cloudflare Pages)**:
   * `BACKEND_URL`: `https://homely-backend.onrender.com` (Aapka STEP 2 me mila hua backend URL)
   * `VITE_API_URL`: `/api`
7. **Save and Deploy** par click karein!
   * Cloudflare automatically aapka project build karega.
   * Edge CDN par globally deploy ho jayega aur aapko link milega:
     `https://homexa.pages.dev`

---

## 🔗 Cloudflare Proxy Kaise Kaam Karta Hai?

Aapke repo me `functions/api/[[...catchall]].js` aur `worker.js` configured hai.
* Jab user browser me `https://homexa.pages.dev/api/properties` call karega:
* Cloudflare Pages Functions request ko catch karega aur safely aapke backend `https://homely-backend.onrender.com/api/properties` par forward kar dega.
* **Benefits**:
  1. No CORS error (kyunki same-origin `/api` par request hoti hai).
  2. Backend URL visitors se hidden rehta hai.
  3. Cloudflare DDoS protection aur global edge security milti hai.

---

## 🌍 STEP 4: Custom Domain Connect Karein (Optional)

Agar aapke paas apna domain hai (e.g. `yourdomain.com`):

1. **Cloudflare Pages** me project open karein -> **Custom domains** tab par click karein.
2. **Set up a custom domain** -> Apna domain type karein (`yourdomain.com` ya `app.yourdomain.com`).
3. Cloudflare automatically DNS CNAME create kar dega.
4. **SSL/TLS Encryption**:
   * Cloudflare Dashboard > **SSL/TLS** > Set to **Full (Strict)**.
5. Backend Render me jakar `FRONTEND_URL` environment variable ko update karke `https://yourdomain.com` kar dein.

---

## ✅ Deployment Checklist

- [x] AWS App Runner file (`apprunner.yaml`) deleted from repository.
- [x] Hardcoded AWS EC2 IP (`44.222.204.56`) completely removed.
- [x] Cloudflare Worker (`worker.js`) & Cloudflare Pages Functions configured with dynamic `env.BACKEND_URL`.
- [x] Static SPA routing configured in `_redirects` (`/* /index.html 200`).
- [x] Static sitemap generation fixed without live API dependency during build.
- [x] Frontend builds cleanly with `npm run build`.
- [ ] AWS EC2 instance terminated via AWS Console.
- [ ] Backend deployed on Render.com with MongoDB Atlas.
- [ ] Cloudflare Pages connected with GitHub repository and `BACKEND_URL` env variable set.
