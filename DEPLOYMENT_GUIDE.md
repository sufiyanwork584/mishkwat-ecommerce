# NexaBuy Full-Stack MERN E-Commerce Deployment Guide

This guide provides step-by-step instructions for deploying the NexaBuy e-commerce application to production environment hosting providers.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Database Setup: MongoDB Atlas](#2-database-setup-mongodb-atlas)
3. [Cloudinary Setup: Media Management](#3-cloudinary-setup-media-management)
4. [Razorpay Setup: Payment Processing](#4-razorpay-setup-payment-processing)
5. [Backend Deployment: Render / Railway](#5-backend-deployment-render--railway)
6. [Frontend Deployment: Vercel](#6-frontend-deployment-vercel)
7. [Post-Deployment Validation](#7-post-deployment-validation)

---

## 1. Prerequisites

Before starting, ensure you have:
- A GitHub account and the NexaBuy code pushed to a repository.
- Node.js (v18+) installed locally.
- Account log-ins for MongoDB Atlas, Render/Railway, Vercel, Cloudinary, and Razorpay.

---

## 2. Database Setup: MongoDB Atlas

MongoDB Atlas hosts your production database.

1. **Sign Up / Log In**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. **Create Project**: Create a new project named `NexaBuy`.
3. **Build Database**:
   - Choose the **M0 Free Shared Tier**.
   - Select your preferred cloud provider (AWS/GCP) and region (e.g., Mumbai, Singapore).
   - Click **Create**.
4. **Security & Authentication**:
   - Create a database user. Select **Username and Password** authentication.
   - Note down the username and password (you'll need them for the connection string).
5. **Configure Network Access**:
   - Go to **Network Access** under the Security menu.
   - Click **Add IP Address**.
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) since cloud hosts like Render and Vercel use dynamic IP addresses.
6. **Retrieve Connection String**:
   - Click **Database** under Deployment.
   - Click **Connect** next to your cluster.
   - Choose **Drivers** under "Connect to your application".
   - Copy the connection string. It will look like this:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<username>` and `<password>` with your database user details and add `/nexabuy` before `?` to specify the database name.

---

## 3. Cloudinary Setup: Media Management

Cloudinary is used for uploading and resizing product images and user avatars dynamically.

1. Create a free account on [Cloudinary](https://cloudinary.com).
2. Open the **Console Dashboard**.
3. Under the **Product Environment Settings**, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
4. Save these values to include in the Backend Environment settings.

---

## 4. Razorpay Setup: Payment Processing

Razorpay processes all payment orders for items in the user cart.

1. Log into the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Navigate to **Settings** -> **API Keys**.
3. Click **Generate Key** (make sure you are in **Test Mode** first, or **Live Mode** if ready for production).
4. Copy the:
   - **Key ID**
   - **Key Secret**
5. Save these values for the Backend Environment settings.

---

## 5. Backend Deployment: Render / Railway

Here we deploy our Node.js/Express API.

### Option A: Render (Free Tier)
1. Go to [Render](https://render.com) and log in.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Name**: `nexabuy-backend`
   - **Region**: Same as your MongoDB Atlas cluster.
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` or standard pricing plan.
5. Click **Advanced** and add the following **Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGO_URI` = `[Your MongoDB Atlas connection string]`
   - `JWT_SECRET` = `[Generate a long random string]`
   - `JWT_REFRESH_SECRET` = `[Generate another long random string]`
   - `JWT_EXPIRE` = `15m`
   - `JWT_REFRESH_EXPIRE` = `7d`
   - `CLOUDINARY_CLOUD_NAME` = `[Your Cloudinary Cloud Name]`
   - `CLOUDINARY_API_KEY` = `[Your Cloudinary API Key]`
   - `CLOUDINARY_API_SECRET` = `[Your Cloudinary API Secret]`
   - `RAZORPAY_KEY_ID` = `[Your Razorpay Key ID]`
   - `RAZORPAY_KEY_SECRET` = `[Your Razorpay Key Secret]`
   - `CLIENT_URL` = `[Your Vercel URL (e.g. https://nexabuy.vercel.app)]`
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `[Your SMTP/Gmail account]`
   - `SMTP_PASS` = `[Your Gmail App Password]`
6. Click **Create Web Service**. Render will build and deploy the server. Note down your Render service URL (e.g., `https://nexabuy-backend.onrender.com`).

---

## 6. Frontend Deployment: Vercel

Here we deploy our static React/Vite web application.

1. Go to [Vercel](https://vercel.com) and log in.
2. Click **Add New** -> **Project**.
3. Select and import your GitHub repository.
4. Set the following settings:
   - **Project Name**: `nexabuy`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build and Output Settings**: Default (Vercel automatically handles Vite build configurations).
5. Open the **Environment Variables** section and add:
   - `VITE_API_URL` = `[Your Render service URL]/api/v1` (e.g., `https://nexabuy-backend.onrender.com/api/v1`)
6. Create a `vercel.json` file inside the `client` directory to support clean client-side routing on page refreshes:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
7. Click **Deploy**. Vercel will install dependencies, build the assets, and deploy the application.

---

## 7. Post-Deployment Validation

Once both services are successfully deployed:

1. **Verify API Access**:
   Visit `[Your Render backend URL]/api/v1/health` in a browser. It should return a `{"success": true, "message": "NexaBuy API is running"}` JSON response.
2. **Seed Initial Database Content**:
   Log into your Render dashboard, open the terminal of your web service, and run the seed command:
   ```bash
   npm run seed
   ```
   This will populate categories, initial products, and the administrator credentials.
3. **Register & Order**:
   Open the Vercel site URL, register a new account, browse products, add items to the cart, apply the sample promo code `WELCOME10`, and execute a checkout payment test.
