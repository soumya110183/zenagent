# Zengent AI - Local Database Setup Guide

## 📦 Database Export Created
**File:** `zengent_ai_backup.sql` (17MB)
**Export Date:** October 13, 2025

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Download the Database Export

1. The database file `zengent_ai_backup.sql` is ready in your Replit project
2. Download it to your local machine:
   - Click on the file in the Replit file explorer
   - Use the "Download" option, or
   - Use the Shell tab and run: `cat zengent_ai_backup.sql` to copy the content

---

### Step 2: Install PostgreSQL Locally

#### **Windows:**
```bash
# Download PostgreSQL installer from:
https://www.postgresql.org/download/windows/

# Or use Chocolatey:
choco install postgresql
```

#### **macOS:**
```bash
# Using Homebrew:
brew install postgresql@16
brew services start postgresql@16
```

#### **Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

### Step 3: Create Local Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user (run these commands in psql)
CREATE DATABASE zengent_ai;
CREATE USER zengent_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE zengent_ai TO zengent_user;
\q
```

---

### Step 4: Import the Database

```bash
# Navigate to where you saved zengent_ai_backup.sql
cd /path/to/downloaded/file

# Import the database
psql -U zengent_user -d zengent_ai -f zengent_ai_backup.sql

# Or if using postgres user:
sudo -u postgres psql -d zengent_ai -f zengent_ai_backup.sql
```

---

### Step 5: Verify the Import

```bash
# Login to the database
psql -U zengent_user -d zengent_ai

# Check tables
\dt

# You should see:
# - projects
# - sessions  
# - source_files
# - users

# Check record counts
SELECT 'projects' as table_name, COUNT(*) FROM projects
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'source_files', COUNT(*) FROM source_files;

# Exit
\q
```

---

### Step 6: Configure Local Environment

Create a `.env` file in your local project:

```env
# Database Configuration
DATABASE_URL=postgresql://zengent_user:your_secure_password@localhost:5432/zengent_ai
PGHOST=localhost
PGPORT=5432
PGDATABASE=zengent_ai
PGUSER=zengent_user
PGPASSWORD=your_secure_password

# Node Environment
NODE_ENV=development
PORT=5000
```

---

### Step 7: Update Database Connection (Optional)

If you need to modify the connection settings, update `server/db.ts`:

```typescript
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Use local PostgreSQL connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

---

## 📊 Database Schema Overview

### **Users Table**
- User authentication and profiles
- Fields: id, username, email, password, firstName, lastName, position, profileImageUrl, isActive

### **Projects Table**
- Analyzed projects (ZIP uploads & GitHub repos)
- Fields: id, name, githubUrl, sourceType, projectType, status, analysisData (JSON), fileCount, controllerCount, serviceCount, repositoryCount

### **Source Files Table**  
- Actual source code content
- Fields: id, projectId, relativePath, content, fileSize, language

### **Sessions Table**
- Express session management
- Fields: sid, sess (JSON), expire

---

## 🔧 Troubleshooting

### **Connection Refused Error:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Start PostgreSQL if needed
sudo systemctl start postgresql  # Linux
brew services start postgresql@16  # macOS
```

### **Authentication Failed:**
```bash
# Reset PostgreSQL user password
sudo -u postgres psql
ALTER USER zengent_user WITH PASSWORD 'new_password';
\q
```

### **Permission Denied:**
```bash
# Grant all permissions
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE zengent_ai TO zengent_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO zengent_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO zengent_user;
\q
```

### **Port Already in Use:**
```bash
# Check what's using port 5432
sudo lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Change PostgreSQL port in postgresql.conf
# Then update DATABASE_URL with new port
```

---

## 🎯 Next Steps

1. ✅ Download `zengent_ai_backup.sql`
2. ✅ Install PostgreSQL
3. ✅ Create database and user
4. ✅ Import the SQL backup
5. ✅ Configure environment variables
6. ✅ Run your application locally

---

## 📝 Notes

- **Data Size:** The current export is 17MB
- **JSONB Fields:** `analysisData` contains complete project analysis results
- **Sessions:** May expire - these can be cleared if needed
- **Passwords:** User passwords are bcrypt hashed for security

---

## 🔐 Security Recommendations

1. **Use strong passwords** for your PostgreSQL user
2. **Don't commit** `.env` file to version control
3. **Backup regularly** using `pg_dump`
4. **Restrict access** to localhost only for development
5. **Use SSL** for production deployments

---

**Need help?** Check PostgreSQL documentation at https://www.postgresql.org/docs/
