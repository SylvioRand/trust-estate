# 🔧 Environment Variables Configuration

This file describes all the environment variables required for the application to run correctly. Copy `.env.example` to `.env` and fill in each value according to your environment.

```bash
cp .env.example .env
```

---

## 🌐 Network & Server

| Variable | Description | Example |
|----------|-------------|---------|
| `IP` | IP address of the host machine — used to build the public-facing URL via `nip.io` | `10.11.9.13` |
| `PORT_AUTH_SERVICE` | Port for the authentication service | `3001` |
| `PORT_AUTH_RESERVATION` | Port for the reservation service | `3003` |

> **Note:** The `IP` variable is reused to dynamically construct `FRONTEND_URL` using the `nip.io` wildcard DNS service (e.g. `https://10.11.9.13.nip.io:8443`). No DNS configuration is required — `nip.io` resolves any subdomain back to the embedded IP.

---

## 🖥️ Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | Public frontend URL — built dynamically from `IP` | `https://${IP}.nip.io:8443` |
| `VITE_FRONTEND_URL` | Frontend URL exposed to Vite (client-side) — mirrors `FRONTEND_URL` | `${FRONTEND_URL}` |

> **Note:** `VITE_FRONTEND_URL` must be prefixed with `VITE_` to be accessible in the Vite client bundle.

---

## 🔗 Microservice URLs (internal communication)

These URLs are used for inter-service communication **inside the Docker network**. Each service is reached by its container name rather than `localhost`.

| Variable | Description | Docker value |
|----------|-------------|--------------|
| `AUTH_SERVICE_URL` | URL of the authentication service | `http://auth-service:3001` |
| `LISTINGS_SERVICE_URL` | URL of the listings management service | `http://listings-service:3002` |
| `RESERVATIONS_SERVICE_URL` | URL of the reservations service | `http://reservations-service:3003` |
| `RESERVATION_SERVICE_URL` | Alias for the reservations service (used by some services) | `http://reservations-service:3003` |
| `CREDITS_SERVICE_URL` | URL of the credits service | `http://credits-service:3004` |
| `AI_SERVICE_URL` | URL of the AI service | `http://ai-service:3005` |

---

## 🔐 Security & Authentication

| Variable | Description | Value |
|----------|-------------|-------|
| `COOKIE_SECRET` | Secret used to sign session cookies — must be a long random hex string | 128-char hex string |
| `JWT_SECRET_PRIVATE_KEY` | Path to the RSA private key file used to sign JWTs | `../../secret/jwtTokenService/jwt_auth_private.key` |
| `JWT_SECRET_PUBLIC_KEY` | Path to the RSA public key file used to verify JWTs | `../../secret/jwtTokenService/jwt_auth_public.pem` |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | random string |
| `INTERNAL_KEY_SECRET` | Shared secret key for authenticated inter-service calls | random string |

### Generating RSA Keys

The RSA key pair must be present at the paths defined above **before starting the application**.

```bash
# Create the directory
mkdir -p secret/jwtTokenService

# Generate private key
openssl genrsa -out secret/jwtTokenService/jwt_auth_private.key 2048

# Extract public key
openssl rsa -in secret/jwtTokenService/jwt_auth_private.key \
            -pubout \
            -out secret/jwtTokenService/jwt_auth_public.pem
```

### Generating a strong `COOKIE_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> ⚠️ Never commit the `secret/` directory or the `.env` file to Git. Add both to `.gitignore`.

---

## 🗄️ Database (PostgreSQL)

| Variable | Description | Value |
|----------|-------------|-------|
| `POSTGRES_USER` | PostgreSQL username | `trustestate` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `trustestate_secret` |
| `POSTGRES_DB` | Database name | `trustestate` |
| `DATABASE_URL` | Full connection URL — built dynamically from the variables above | `postgresql://trustestate:trustestate_secret@db:5432/trustestate` |

> **Note:** `DATABASE_URL` uses `@db:5432` where `db` is the name of the PostgreSQL Docker container. For local development without Docker, replace `db` with `localhost`.

### `DATABASE_URL` format

```
postgresql://[POSTGRES_USER]:[POSTGRES_PASSWORD]@[HOST]:[PORT]/[POSTGRES_DB]
```

---

## 🔑 Google OAuth (Social Authentication)

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | [Google Cloud Console](https://console.cloud.google.com/) |
| `REDIRECT_URI` | Redirect URI after Google authentication | `https://${IP}.nip.io:8443/auth/google/callback` |
| `AUTH_URL` | Google OAuth authorization URL | `https://accounts.google.com/o/oauth2/v2/auth` |
| `TOKEN_URL` | Google OAuth token exchange URL | `https://oauth2.googleapis.com/token` |
| `USER_INFO_URL` | URL to fetch Google user info | `https://www.googleapis.com/oauth2/v2/userinfo` |

### Google Cloud Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select an existing one
3. Enable the **Google+ API** or **People API**
4. Under **Credentials**, create an **OAuth 2.0 Client ID**
5. Add your `REDIRECT_URI` to the list of authorized redirect URIs

---

## 📧 Email Sending (Gmail)

| Variable | Description | Example |
|----------|-------------|---------|
| `GMAIL_USER` | Gmail address used to send emails | `myapp@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail app password (not your Google account password) | `xxxx xxxx xxxx xxxx` |

### Generating a Gmail App Password

1. Enable **2-Step Verification** on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate a password for "Mail" and paste it into `GMAIL_APP_PASSWORD`

---

## 🤖 AI Service (LLM)

For the llm, use NVIDIA llm https://build.nvidia.com/google/gemma-3-27b-it

| Variable | Description | Example |
|----------|-------------|---------|
| `LLM_API_KEY` | API key for the LLM provider (OpenAI, Anthropic, etc.) | `sk-...` |
| `LLM_API_URL` | LLM API base URL | `https://integrate.api.nvidia.com/v1/chat/completions` |
| `LLM_MODEL` | LLM model used for text generation | `google/gemma-3-27b-it` |
| `EMBEDDING_MODEL` | Embedding model for vector/semantic search | `text-embedding-3-small` |

---

## 📄 Example `.env` file

```env
# Network
IP=10.11.9.13
PORT_AUTH_SERVICE=3001
PORT_AUTH_RESERVATION=3003

# Frontend
FRONTEND_URL=https://${IP}.nip.io:8443
VITE_FRONTEND_URL=${FRONTEND_URL}

# Security
COOKIE_SECRET=<128-char hex string>
JWT_SECRET_PRIVATE_KEY=../../secret/jwtTokenService/jwt_auth_private.key
JWT_SECRET_PUBLIC_KEY=../../secret/jwtTokenService/jwt_auth_public.pem
JWT_REFRESH_SECRET=<random string>
INTERNAL_KEY_SECRET=<random string>

# Internal Service Communication URLs (Docker Network)
AUTH_SERVICE_URL=http://auth-service:3001
LISTINGS_SERVICE_URL=http://listings-service:3002
RESERVATIONS_SERVICE_URL=http://reservations-service:3003
RESERVATION_SERVICE_URL=http://reservations-service:3003
CREDITS_SERVICE_URL=http://credits-service:3004
AI_SERVICE_URL=http://ai-service:3005

# PostgreSQL
POSTGRES_USER=trustestate
POSTGRES_PASSWORD=trustestate_secret
POSTGRES_DB=trustestate
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
REDIRECT_URI=https://${IP}.nip.io:8443/auth/google/callback
AUTH_URL=https://accounts.google.com/o/oauth2/v2/auth
TOKEN_URL=https://oauth2.googleapis.com/token
USER_INFO_URL=https://www.googleapis.com/oauth2/v2/userinfo

# Gmail
GMAIL_USER=myapp@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# AI / LLM
LLM_API_KEY=sk-...
LLM_API_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
EMBEDDING_MODEL=text-embedding-3-small
```

---

## ⚠️ Best Practices

- **Never commit `.env`** — add it to `.gitignore`
- **Never commit the `secret/` directory** — RSA keys must stay local or be injected via CI/CD secrets
- **Use `.env.example`** as a versioned template (without sensitive values)
- **Use different secrets** across dev, staging, and production environments
- **Use strong secrets** — at least 32 random characters for secret keys

```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```