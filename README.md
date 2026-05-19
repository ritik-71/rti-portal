# Right to Information (RTI) Portal - Production Ready

The **RTI Portal** is a highly scalable, secure, and production-ready web application built for managing and tracking Right to Information requests. It features enterprise-grade Role-Based Access Control (RBAC), Row Level Security (RLS), Zod validation, and optimized Serverless Route Handlers.

## 🚀 Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Backend:** Next.js Serverless Route Handlers (`/api/*`)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (JWT)
- **Storage:** Supabase Storage Buckets (`rti-files`)
- **Validation:** Zod
- **Animations:** Framer Motion
- **UI & Visualization:** CSS Modules, Lucide React, Recharts

---

## 🔒 Security & Architecture Features

### 1. Database Security (Row Level Security)
The database enforces strict RLS policies to prevent unauthorized data access:
- **Citizens:** Can only view and insert their own applications.
- **Officers/Admins:** Have elevated privileges to view all records, update statuses, and add official remarks.
- **Public Tracking:** Citizens can track applications securely via a backend API route (`/api/track`) that leverages a Service Role Key, entirely bypassing the need for public RLS exposure.

### 2. Role-Based Access Control (RBAC)
- **Server-Side Validation:** All API routes perform robust server-side profile verification. For instance, only users with `admin` or `officer` roles can modify an application's `status` or `remarks`.
- **Privilege Escalation Prevention:** Self-approval vulnerabilities are completely blocked at the backend routing level.

### 3. File Uploads & Storage
- Integrated secure document attachments (PDF, JPG, PNG).
- Max payload limits (5MB) and strict MIME type validations enforced prior to Supabase Storage uploads.

### 4. Health Monitoring & CI/CD
- **`/api/health`**: Zero-downtime monitoring route for database connectivity and uptime tracking.
- **GitHub Actions (`.github/workflows/deploy.yml`)**: Automated CI pipeline that runs ESLint, TypeScript compilation, and build verification on all PRs and pushes to `main`.

---

## 🛠️ Environment Configuration

Copy the `.env.example` file to create your `.env.local` for local development, and add these variables to your Vercel/Render dashboard for production:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional (Only if separating Frontend to Vercel and Backend to Render)
NEXT_PUBLIC_API_URL=https://your-render-backend-url.com
```

---

## 🚀 Deployment Guide

### Option A: Unified Vercel Deployment (Recommended)
This deploys both the Next.js Frontend and the Serverless API Routes to Vercel.
1. Connect your GitHub repository to Vercel.
2. Ensure the Framework Preset is **Next.js**.
3. Add the required Environment Variables.
4. Vercel will automatically apply the strict security headers (CSP, HSTS) defined in `vercel.json`.
5. Deploy.

### Option B: Decoupled Deployment (Frontend on Vercel, API on Render)
1. **Frontend (Vercel):** Follow Option A, but set `NEXT_PUBLIC_API_URL` to your Render API domain.
2. **Backend (Render):** 
   - Connect your repo to Render.
   - Use the provided `render.yaml` blueprint.
   - Render will build and start the Next.js application in production server mode using `npm run start`.
   - The `/api/health` route will automatically be used for zero-downtime deployment health checks.

---

## 🗄️ Database Provisioning

To prepare your Supabase database for production, execute the `db_upgrade.sql` file in the Supabase SQL Editor. This will:
1. Provision required tables (`applications`, `profiles`, `audit_logs`).
2. Attach automated triggers for profile generation on signup.
3. Lock down all tables with secure Row Level Security (RLS) policies.
4. Establish the `rti-files` storage bucket.
5. Generate query-optimized indexes on heavily searched columns (`receipt_no`, `user_id`, `status`).

---

*Built with security, maintainability, and scalability as core principles.*
