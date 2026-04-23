# Extej — Crypto Wallet & Transaction Validation Dashboard

> Premium dark-themed full-stack crypto dashboard with AWS Cognito auth, DynamoDB, FastAPI, and React 18.

![Extej Dashboard](./frontend/dist/assets/index-CcqAsrZz.css)

## 🏗️ Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18 + TypeScript + Vite 5 + Tailwind CSS v3 |
| State | Zustand + TanStack Query |
| Animations | Framer Motion |
| Charts | Recharts |
| Auth (Client) | AWS Amplify v6 |
| Backend | Python 3.11 + FastAPI + Pydantic v2 |
| Lambda | Mangum adapter |
| Database | AWS DynamoDB (single-table design) |
| Auth (Server) | AWS Cognito (JWT RS256) |
| Infra | AWS CDK (Python) |

---

## 📁 Project Structure

```
extej/
├── frontend/          ← React 18 + Vite frontend
├── backend/           ← FastAPI backend
├── infrastructure/    ← AWS CDK stacks
├── docker-compose.yml ← Local dev environment
└── README.md
```

---

## 🚀 Quick Start (Local Dev)

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Docker + Docker Compose

### 1. Start DynamoDB Local

```bash
cd extej
docker-compose up dynamodb-local -d
```

### 2. Start the Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** — the dashboard opens directly (auth bypassed in demo mode).

---

## 🔐 AWS Setup Guide

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API** and **Google Identity**
4. Go to **OAuth 2.0 Client IDs** → Create Web Application
5. Add authorized redirect URIs:
   - `https://extej.auth.ap-south-1.amazoncognito.com/oauth2/idpresponse`
6. Note your **Client ID** and **Client Secret**

### Step 2: Store Google Secrets in AWS Secrets Manager

```bash
aws secretsmanager create-secret \
  --name "extej/google-oauth" \
  --secret-string '{"client_id":"YOUR_GOOGLE_CLIENT_ID","client_secret":"YOUR_GOOGLE_CLIENT_SECRET"}' \
  --region ap-south-1
```

### Step 3: Deploy AWS Infrastructure (CDK)

```bash
cd infrastructure/cdk
pip install aws-cdk-lib constructs
cdk bootstrap aws://ACCOUNT_ID/ap-south-1
cdk deploy --all
```

CDK will output:
- `UserPoolId` → `VITE_COGNITO_USER_POOL_ID`
- `ClientId` → `VITE_COGNITO_CLIENT_ID`
- `ApiUrl` → `VITE_API_BASE_URL`
- `CloudFrontUrl` → your frontend URL

### Step 4: Configure Frontend Environment

Copy `.env` and fill in the CDK outputs:

```env
VITE_AWS_REGION=ap-south-1
VITE_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=extej.auth.ap-south-1.amazoncognito.com
VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/prod
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

### Step 5: Build and Deploy Frontend

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://extej-frontend-ACCOUNT_ID --delete
aws cloudfront create-invalidation --distribution-id DIST_ID --paths "/*"
```

---

## 🗄️ DynamoDB Schema

Single table: **extej-users**

| PK | SK | Description |
|----|----|----|
| `USER#{sub}` | `PROFILE` | User profile |
| `USER#{sub}` | `WALLET#{id}` | Wallet record |
| `USER#{sub}` | `TX#{ts}#{id}` | Transaction |
| `USER#{sub}` | `ADDRESS#{id}` | Address book entry |
| `USER#{sub}` | `SETTINGS` | User settings |

**GSIs:**
- `email-index`: PK = `email`
- `status-index`: PK = `status`, SK = `createdAt`

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/sync-user` | Create/update DynamoDB record |
| GET | `/auth/me` | Get full user profile |
| GET | `/user/profile` | User profile |
| PATCH | `/user/profile` | Update profile |
| GET | `/wallet` | List wallets |
| POST | `/wallet` | Add wallet |
| DELETE | `/wallet/{id}` | Remove wallet |
| GET | `/transactions` | Paginated transactions |
| POST | `/transactions` | Create transaction |
| PATCH | `/transactions/{id}/status` | Update TX status |
| GET | `/transactions/export` | CSV export |
| POST | `/validate/address` | Validate single address |
| POST | `/validate/address/bulk` | Bulk validate (max 20) |
| POST | `/validate/transaction` | Validate TX hash |
| GET | `/addresses` | Address book |
| POST | `/addresses` | Add address |

All protected endpoints require: `Authorization: Bearer <access_token>`

---

## 🔑 Auth Flows

### Email/Password
1. `/signup` → Cognito creates user, sends OTP email
2. `/confirm-email` → Enter 6-digit OTP
3. `/login` → Tokens stored, redirect to `/dashboard`

### Google OAuth
1. Click "Continue with Google"
2. Amplify calls `signInWithRedirect({ provider: 'Google' })`
3. Cognito Hosted UI → Google consent
4. Redirect back to `/auth/callback`
5. Backend auto-creates DynamoDB user on first login

### Token Refresh
- Amplify handles auto-refresh via refresh token
- If refresh fails → auto-logout → `/login`

---

## 🧪 Local Testing

```bash
# Health check
curl http://localhost:8001/health

# Validate an ETH address (no auth needed for testing)
curl -X POST http://localhost:8001/validate/address \
  -H "Content-Type: application/json" \
  -d '{"address": "0x742d35Cc6634C0532925a3b8D4C9B3E7F02F1A9", "coin": "ETH"}'
```

---

## 📦 Production Checklist

- [ ] AWS credentials configured in GitHub Actions / CI
- [ ] Google OAuth Client ID/Secret in Secrets Manager
- [ ] Cognito User Pool created and configured
- [ ] DynamoDB table created with CDK
- [ ] Backend Lambda deployed and API Gateway live
- [ ] Frontend built and deployed to S3/CloudFront
- [ ] Custom domain configured in Route 53
- [ ] HTTPS certificate via ACM
- [ ] Environment variables all filled in

---

## 🛡️ Security Notes

- All secrets in **AWS Secrets Manager** — never in code
- CORS restricted to specific origins
- JWT verified via Cognito JWKS (RS256)
- DynamoDB access via IAM role (least privilege)
- Password policy enforced in Cognito (8 chars, uppercase, number, symbol)
- Refresh token rotation enabled (30-day validity)

---

Made with 🧡 using React, FastAPI, and AWS
