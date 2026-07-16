# EHMS — Electronic Hospital Management System

A full-stack hospital management system built with:

- **Backend:** Kotlin, Spring Boot, Spring Security, REST API, Hibernate/JPA
- **Database:** MySQL
- **Frontend:** Next.js, React, JavaScript, Chart.js
- **Authentication:** JWT with `ADMIN` and `USER` roles

Repository:

```text
https://github.com/subjeevan/ehms
```

Default branch:

```text
master
```

---

## 1. Main features

- JWT login and role-based authorization
- Admin and normal user roles
- Patient registration and patient CRUD
- Automatic registration billing
- General, Paying, and Insurance patient types
- Insurance details
- Department and doctor setup
- User management
- Dashboard and monthly registration chart
- Earnings dashboard for administrators
- Search, sorting, pagination, and Excel export
- Client-side and server-side validation
- Responsive desktop, tablet, and mobile design
- Profile details and password change
- Public home page and Contact Us modal

---

## 2. Prerequisites

Install these before running the project:

| Software | Recommended version |
|---|---:|
| Git | Current stable version |
| Java JDK | 17 |
| MySQL Server | 8.0 or newer |
| Node.js | 20 or newer |
| npm | Included with Node.js |
| IntelliJ IDEA | Optional, for backend development |
| VS Code | Optional, for frontend development |

Verify installation:

```powershell
git --version
java -version
node --version
npm --version
```

You should see Java 17.

---

# 3. Get the project from GitHub

## First-time download

Open PowerShell in the folder where you want to store the project:

```powershell
cd "D:\Web 3.0"
git clone https://github.com/subjeevan/ehms.git
cd ehms
```

Check the branch:

```powershell
git branch
```

Expected result:

```text
* master
```

If necessary:

```powershell
git switch master
```

---

## Update an existing local copy

Open PowerShell in the project root:

```powershell
cd "D:\Web 3.0\ehms"
git status
```

### When there are no local changes

```powershell
git pull origin master
```

### When you want to keep local changes

Commit them first:

```powershell
git add .
git commit -m "Save local changes before pull"
git pull --rebase origin master
```

Or temporarily stash them:

```powershell
git stash push -m "Before pulling latest EHMS"
git pull origin master
git stash pop
```

Resolve any merge conflicts before continuing.

> Do not run `git reset --hard` unless you intentionally want to permanently delete uncommitted work.

---

# 4. MySQL database setup

## 4.1 Start MySQL

Make sure the MySQL service is running.

You can open:

```text
MySQL Workbench
```

or use Command Prompt/PowerShell:

```powershell
mysql -u root -p
```

Enter your MySQL root password.

---

## 4.2 Create the database and application user

Run the following SQL as the MySQL root user.

Replace `CHANGE_ME_DB_PASSWORD` with a password that you choose.

```sql
CREATE DATABASE IF NOT EXISTS hms_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'hms_user'@'localhost'
IDENTIFIED BY 'CHANGE_ME_DB_PASSWORD';

ALTER USER 'hms_user'@'localhost'
IDENTIFIED BY 'CHANGE_ME_DB_PASSWORD';

GRANT ALL PRIVILEGES ON hms_db.*
TO 'hms_user'@'localhost';

FLUSH PRIVILEGES;
```

Check the database:

```sql
SHOW DATABASES;
```

Exit MySQL:

```sql
EXIT;
```

---

## 4.3 Test the application database account

```powershell
mysql -h localhost -P 3306 -u hms_user -p
```

Enter the same password used in the SQL setup.

Then run:

```sql
USE hms_db;
SHOW TABLES;
EXIT;
```

An empty table list is normal before the backend starts for the first time.

If the login fails, do not start Spring Boot yet. Fix the MySQL username, password, or permissions first.

---

# 5. Backend environment configuration

## 5.1 Create the backend `.env` file

Create this file in the project root:

```text
D:\Web 3.0\ehms\.env
```

Use this content:

```properties
DB_URL=jdbc:mysql://localhost:3306/hms_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Tokyo
DB_USERNAME=hms_user
DB_PASSWORD=CHANGE_ME_DB_PASSWORD

JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
JWT_EXPIRATION_MINUTES=120

CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Rules:

- Do not add quotes around values.
- `DB_PASSWORD` must match the MySQL password.
- `JWT_SECRET` should be long and private.
- Never commit the real `.env` file to GitHub.

---

## 5.2 Generate a JWT secret on Windows

Open PowerShell and run:

```powershell
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

Copy the generated output and use it as:

```properties
JWT_SECRET=PASTE_GENERATED_VALUE_HERE
```

The JWT secret is created by you. It does not come from MySQL or Spring Boot.

---

## 5.3 Configure `application.properties`

File location:

```text
src/main/resources/application.properties
```

Use this secure configuration:

```properties
spring.application.name=ehms
server.port=8080

# Load the extensionless .env file from the project root.
spring.config.import=optional:file:./.env[.properties]

# MySQL
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Hibernate / JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.time_zone=Asia/Tokyo

# JWT
app.jwt.secret=${JWT_SECRET}
app.jwt.expiration-minutes=${JWT_EXPIRATION_MINUTES:120}

# Frontend origin
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000}

# Logging
logging.level.root=INFO
logging.level.kcg.edu.ehms=DEBUG
logging.level.org.springframework.security=INFO
logging.file.name=logs/ehms.log
```

Important property name:

```properties
app.jwt.expiration-minutes
```

Do not replace it with `app.jwt.expiration-ms` unless the Kotlin JWT service is also changed.

---

## 5.4 Confirm the IntelliJ working directory

When starting the backend from IntelliJ:

1. Open **Run**
2. Select **Edit Configurations**
3. Select `EhmsApplicationKt`
4. Set **Working directory** to the project root:

```text
D:\Web 3.0\ehms
```

The `.env` import uses `./.env`, so the working directory must be the backend project root.

If you use the `.env` file, remove old `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` entries from the IntelliJ run configuration to avoid overriding the file.

---

# 6. Run the backend

## Windows PowerShell

From the project root:

```powershell
cd "D:\Web 3.0\ehms"
.\mvnw.cmd clean spring-boot:run
```

## macOS/Linux

```bash
cd /path/to/ehms
chmod +x mvnw
./mvnw clean spring-boot:run
```

The backend should start at:

```text
http://localhost:8080
```

The REST API base URL is:

```text
http://localhost:8080/api
```

A successful startup normally includes messages similar to:

```text
HikariPool-1 - Start completed
Tomcat started on port 8080
Started EhmsApplicationKt
```

On the first successful startup, Hibernate creates or updates the tables because:

```properties
spring.jpa.hibernate.ddl-auto=update
```

The data initializer also creates initial roles, users, departments, doctors, sample records, and charge settings when required.

---

# 7. Frontend environment configuration

Create:

```text
frontend/.env.local
```

Content:

```properties
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Do not add quotes.

This file should not be committed to GitHub.

---

# 8. Install and run the frontend

Open a second PowerShell window.

```powershell
cd "D:\Web 3.0\ehms\frontend"
```

If `package-lock.json` exists, use:

```powershell
npm ci
```

Otherwise use:

```powershell
npm install
```

Start the Next.js development server:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

The frontend calls the Spring Boot REST API asynchronously through Fetch API.

---

# 9. Default login accounts

The backend data initializer creates these accounts when they do not already exist:

## Administrator

```text
Username: admin
Password: Admin@123
```

## Normal user

```text
Username: user
Password: User@123
```

Change default passwords before deployment or demonstration outside a local development environment.

Role behavior:

- `ADMIN` can access administrative functions such as user management, setup, deletion, editing, and earnings.
- `USER` has limited permissions and must not call or display the administrator-only earnings API.

---

# 10. Normal startup order

Use this order every time:

1. Start MySQL.
2. Test the `hms_user` database login if necessary.
3. Start the Spring Boot backend.
4. Confirm port `8080` is running.
5. Start the Next.js frontend.
6. Open `http://localhost:3000`.
7. Log in.

---

# 11. Production build test

Before submitting or deploying the project, test both builds.

## Backend compile

```powershell
cd "D:\Web 3.0\ehms"
.\mvnw.cmd clean test
.\mvnw.cmd clean package
```

The generated backend JAR is placed under:

```text
target/
```

Run the packaged JAR:

```powershell
java -jar target\ehms-0.0.1-SNAPSHOT.jar
```

## Frontend build

```powershell
cd "D:\Web 3.0\ehms\frontend"
npm run build
npm run start
```

The production frontend starts at:

```text
http://localhost:3000
```

---

# 12. Confirm the database tables

After the backend starts successfully:

```powershell
mysql -u hms_user -p
```

Then:

```sql
USE hms_db;
SHOW TABLES;
```

The project should create multiple tables, including tables for users, roles, patients, bills, departments, doctors, insurance details, settings, and patient-type charges.

Do not manually create Hibernate-managed tables unless a specific migration is required.

---

# 13. Common troubleshooting

## 13.1 `Access denied for user 'hms_user'@'localhost'`

Cause:

- Wrong MySQL password
- Wrong `DB_PASSWORD`
- Missing MySQL privileges
- A stale IntelliJ or Windows environment variable overrides `.env`

Test directly:

```powershell
mysql -h localhost -P 3306 -u hms_user -p
```

Reset using the root account:

```sql
ALTER USER 'hms_user'@'localhost'
IDENTIFIED BY 'CHANGE_ME_DB_PASSWORD';

GRANT ALL PRIVILEGES ON hms_db.*
TO 'hms_user'@'localhost';

FLUSH PRIVILEGES;
```

Make sure the same password is used in `.env`.

---

## 13.2 `.env` is not being read

Check all of these:

1. The file is named exactly `.env`, not `.env.txt`.
2. It is in the project root, not inside `frontend`.
3. `application.properties` contains:

```properties
spring.config.import=optional:file:./.env[.properties]
```

4. IntelliJ working directory is the project root.
5. Old IntelliJ environment variables are removed.
6. Stop the process completely and restart it.

To display hidden extensions in Windows Explorer:

```text
View → Show → File name extensions
```

---

## 13.3 `Could not resolve placeholder 'app.jwt.expiration-minutes'`

Add this to `application.properties`:

```properties
app.jwt.expiration-minutes=${JWT_EXPIRATION_MINUTES:120}
```

Optionally add this to `.env`:

```properties
JWT_EXPIRATION_MINUTES=120
```

---

## 13.4 `next is not recognized`

Run:

```powershell
cd frontend
npm install
npm run dev
```

Do not copy `node_modules` from another computer.

---

## 13.5 Frontend says it cannot connect to the HMS server

Check:

- Backend is running on port `8080`
- `frontend/.env.local` contains the correct API URL
- The backend URL includes `/api`
- MySQL is running
- No firewall or proxy is blocking local ports

Correct value:

```properties
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

After changing `.env.local`, restart Next.js.

---

## 13.6 CORS error in the browser

Backend `.env`:

```properties
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Frontend should run on:

```text
http://localhost:3000
```

Restart the backend after changing CORS configuration.

---

## 13.7 Port 8080 is already in use

Find the process:

```powershell
netstat -ano | findstr :8080
```

Stop it:

```powershell
taskkill /PID PROCESS_ID /F
```

Replace `PROCESS_ID` with the displayed PID.

For port 3000:

```powershell
netstat -ano | findstr :3000
```

---

## 13.8 Login returns `401 Unauthorized`

Check:

- Correct username and password
- Backend started successfully
- JWT secret is configured
- Browser has no old invalid token

Clear browser storage:

```javascript
localStorage.removeItem("hms_token");
localStorage.removeItem("hms_user");
```

Or use the browser DevTools:

```text
Application → Local Storage → Clear
```

Then log in again.

---

## 13.9 Hibernate warns that MySQL 5.5 is unsupported

Use MySQL 8.0 or newer.

A connection may still start with an old server, but Hibernate 7 may not support all features correctly.

---

## 13.10 Database changes are not appearing

Check:

```properties
spring.jpa.hibernate.ddl-auto=update
```

Then run:

```powershell
.\mvnw.cmd clean spring-boot:run
```

Review the backend log for schema errors.

---

# 14. Git security and repository cleanup

The root `.gitignore` should contain:

```gitignore
# Backend build
target/

# Environment and secrets
.env
.env.*
!.env.example
application-local.properties

# Frontend
frontend/node_modules/
frontend/.next/
frontend/out/
frontend/.env.local
frontend/npm-debug.log*

# Logs
logs/
*.log

# IDE
.idea/
*.iml
.vscode/
```

If `frontend/node_modules` was previously committed:

```powershell
git rm -r --cached frontend/node_modules
git add .gitignore frontend/.gitignore
git commit -m "Remove node_modules from repository"
git push origin master
```

Do not commit:

- `.env`
- `frontend/.env.local`
- Database passwords
- JWT secrets
- `node_modules`
- `.next`
- backend `target`
- application log files

---

# 15. Pull and restart after future updates

Whenever new code is pushed to GitHub:

```powershell
cd "D:\Web 3.0\ehms"
git status
git pull origin master
```

Rebuild backend:

```powershell
.\mvnw.cmd clean spring-boot:run
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Run `npm install` again when `frontend/package.json` or `package-lock.json` changes.

---

# 16. Useful URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:8080` |
| REST API base | `http://localhost:8080/api` |
| Login API | `http://localhost:8080/api/auth/login` |

---

# 17. Suggested development terminal layout

## Terminal 1 — Backend

```powershell
cd "D:\Web 3.0\ehms"
.\mvnw.cmd spring-boot:run
```

## Terminal 2 — Frontend

```powershell
cd "D:\Web 3.0\ehms\frontend"
npm run dev
```

## Terminal 3 — Git or MySQL

```powershell
cd "D:\Web 3.0\ehms"
git status
```

---

## License and academic use

This repository is intended for academic project and demonstration use. Review credentials, secrets, database access, and production security before deployment.
