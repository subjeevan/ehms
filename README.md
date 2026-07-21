# EHMS Setup Guide

## 1. Prerequisites

Install the following software:

* Git
* Java 17
* IntelliJ IDEA
* XAMPP
* Node.js, which includes npm

To install Java 17 using Windows Package Manager, open Command Prompt or PowerShell as Administrator and run:

```cmd
winget install EclipseAdoptium.Temurin.17.JDK
```

### Optional: IntelliJ EnvFile Plugin

Install the EnvFile plugin only when you want IntelliJ IDEA to load variables from the `.env` file automatically.

The plugin is not required when running the project from Command Prompt using the provided batch file or manually loading the environment variables.

---

## 2. Clone the Repository

Open Command Prompt and run:

```cmd
git clone https://github.com/subjeevan/ehms.git
cd ehms
```

## 3. Create the MySQL Database

1. Open the XAMPP Control Panel.
2. Start Apache and MySQL.
3. Open the following address in your browser:

```text
http://localhost/phpmyadmin
```

You can configure the database using either of the following methods.

### Method 1: Create the Database Manually

Open the SQL tab in phpMyAdmin and run:

```sql
CREATE DATABASE IF NOT EXISTS ehms
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'hms_user'@'localhost'
IDENTIFIED BY 'password123';

GRANT ALL PRIVILEGES ON ehms.*
TO 'hms_user'@'localhost';

FLUSH PRIVILEGES;
```

On the first successful run, Spring Boot will automatically create the required database tables and insert the initial system data.

### Method 2: Import the Existing SQL File

1. Open the `database` folder in the project.
2. Locate the `ehms.sql` file.
3. Open phpMyAdmin.
4. Create a database named `ehms`.
5. Select the `ehms` database.
6. Click **Import**.
7. Select the `ehms.sql` file.
8. Start the import.

After importing the database, create the application user and grant access:

```sql
CREATE USER IF NOT EXISTS 'hms_user'@'localhost'
IDENTIFIED BY 'password123';

GRANT ALL PRIVILEGES ON ehms.*
TO 'hms_user'@'localhost';

FLUSH PRIVILEGES;
```

---

## 4. Generate a JWT Secret

Create a random JWT secret containing at least 32 characters.

Example:

```env
JWT_SECRET=Z7mP4vNx8Qk2Ld9Hc5Rt1Yb6Wa3Fs0JuEp8XgK2Vm9Cn4Dh5Qr7Sz1Lt6Bj0MwYUf
```

Do not use the example secret in a production system. Generate your own unique value.

---

## 5. Configure the `.env` File

Copy the provided environment example file:

```text
env.example
```

Rename the copied file to:

```text
.env
```

Open `.env` and enter the database configuration and JWT secret.

Example:

```env
DB_URL=jdbc:mysql://localhost:3306/ehms
DB_USERNAME=hms_user
DB_PASSWORD=password123
JWT_SECRET=your_generated_jwt_secret
```

The username and password must match the MySQL user created in the previous step.

Do not add spaces around the equals sign.

Correct:

```env
DB_USERNAME=hms_user
```

Incorrect:

```env
DB_USERNAME = hms_user
```

---

## 6. Install Frontend and Root Dependencies

The frontend and project root have separate Node.js dependencies.

### Install frontend dependencies

From the project root, run:

```cmd
cd frontend
npm install
cd ..
```

### Install root dependencies

The root dependencies include `concurrently`, which is used to start the frontend and backend together.

Run:

```cmd
npm install
```

If `concurrently` is not already listed in the root `package.json`, install it with:

```cmd
npm install --save-dev concurrently
```

You do not need to install `concurrently` globally.

---

## 7. Run the Frontend and Backend

From the project root folder, run:

```cmd
npm run dev
```

This command starts both applications:

```text
Backend:  http://localhost:8080
Frontend: http://localhost:3000
```

Example command sequence:

```cmd
cd /d E:\ehms

cd frontend
npm install
cd ..

npm install
npm run dev
```
---

## 8. Run the Applications Separately

You can also run each application in a separate terminal.

### Backend
Open the project in IntelliJ IDEA and allow Maven to download the required backend dependencies.

Alternatively, build the backend from Command Prompt:

```cmd
mvnw.cmd clean install
```

---
From the project root:

```cmd
mvnw.cmd spring-boot:run
```

### Frontend

From the frontend folder:

```cmd
cd frontend
npm run dev
```

---

## 9. Confirm That the Applications Are Running

A successful backend startup should show a message similar to:

```text
Tomcat started on port 8080
Started EhmsApplication
```

A successful frontend startup should show:

```text
Local: http://localhost:3000
Ready
```

Open the application in your browser:

```text
http://localhost:3000
```
