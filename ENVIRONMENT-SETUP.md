# Environment Setup Guide

## 🔧 What You Need to Configure

### 1. Database URL (REQUIRED)
**What it is**: Connection string to your PostgreSQL database

**Format**: 
```
postgresql://username:password@host:port/database
```

**Examples**:
```bash
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/smartagrisys"

# Neon Database (cloud)
DATABASE_URL="postgresql://username:password@ep-xyz.us-east-1.aws.neon.tech/smartagrisys?sslmode=require"

# Supabase
DATABASE_URL="postgresql://postgres:password@db.xyz.supabase.co:5432/postgres"
```

### 2. NEXTAUTH_SECRET (REQUIRED if using authentication)
**What it is**: A random secret key used to encrypt user sessions and JWT tokens

**How to generate**:
```bash
# Method 1: Online generator
# Visit: https://generate-secret.vercel.app/32

# Method 2: Command line (if you have OpenSSL)
openssl rand -base64 32

# Method 3: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example**:
```bash
NEXTAUTH_SECRET="Jk7/9XzQm4nP8vR2wE5tY6uI3oA1sD4fG7hJ0kL9mN2bV5cX8z"
```

### 3. MCB Backend URL (NEW - for AI integration)
**What it is**: URL where your Python MCB server is running

**Values**:
```bash
# Local development
MCB_BACKEND_URL=http://localhost:8001

# Production (when deployed)
MCB_BACKEND_URL=https://your-mcb-backend.vercel.app
```

## 🚀 Setup Steps

### Step 1: Copy Environment File
```bash
# In your smartagrisys directory
cp env.local.example .env.local
```

### Step 2: Edit .env.local
```bash
# Open .env.local and update these values:

# Your actual database connection
DATABASE_URL="postgresql://your_user:your_password@your_host:5432/your_database"

# Generate and add a secret key
NEXTAUTH_SECRET="your-generated-32-character-secret"

# MCB backend URL (keep as localhost for now)
MCB_BACKEND_URL=http://localhost:8001
```

### Step 3: Verify Configuration
```bash
# Test database connection
npx prisma db pull

# Test MCB connection (after starting MCB server)
node test-mcb-connection.js
```

## 🔍 Common Issues & Solutions

### Database Connection Issues:
```bash
# Error: "Can't reach database server"
# Solution: Check if PostgreSQL is running and credentials are correct

# Error: "Database does not exist"
# Solution: Create the database first
createdb smartagrisys
```

### Authentication Issues:
```bash
# Error: "NEXTAUTH_SECRET missing"
# Solution: Generate and add NEXTAUTH_SECRET to .env.local

# Error: "Invalid session"
# Solution: Clear browser cookies and restart Next.js server
```

### MCB Connection Issues:
```bash
# Error: "MCB Backend connection failed"
# Solution: Make sure Python MCB server is running on port 8001
cd smart_agri_models
python start.py
```

## 📋 Environment Variables Checklist

**Required for Basic App**:
- ✅ `DATABASE_URL` - Your PostgreSQL connection
- ✅ `NEXTAUTH_SECRET` - Random 32-character string
- ✅ `NEXTAUTH_URL` - http://localhost:3000 (for development)

**Required for AI Features**:
- ✅ `MCB_BACKEND_URL` - http://localhost:8001 (for development)

**Optional**:
- ⚪ `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (for Google login)
- ⚪ `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` (for GitHub login)

## 🎯 Quick Setup Example

If you're using a local PostgreSQL database:

```bash
# .env.local
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/smartagrisys"
NEXTAUTH_SECRET="abc123xyz789randomsecretkey32chars"
NEXTAUTH_URL="http://localhost:3000"
MCB_BACKEND_URL="http://localhost:8001"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🚨 Security Notes

- **Never commit `.env.local`** to git (it's in .gitignore)
- **Use different secrets** for development and production
- **Keep database credentials secure**
- **Regenerate NEXTAUTH_SECRET** if compromised

## 🆘 Need Help?

1. **Database setup**: Check your PostgreSQL installation and credentials
2. **Secret generation**: Use the online generator or command line methods above
3. **MCB integration**: Make sure both servers (Next.js and Python) are running
4. **Authentication**: Clear browser data if having session issues
