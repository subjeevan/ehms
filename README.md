# EHMS - Setup Guide

## 1. Prerequisites

Install the following:

- Git
- Java 17
Open cmd run -> winget install EclipseAdoptium.Temurin.17.JDK
- IntelliJ IDEA
- XAMPP
- Node.js (includes npm)
- IntelliJ **EnvFile** plugin

---

## 2. Clone the Repository

```bash
git clone https://github.com/subjeevan/ehms.git
cd ehms
```

Open the project in IntelliJ IDEA and allow Maven to download all required dependencies.
or 
Open cmd and run -> mvnw.cmd clean install
---

## 3. Create the MySQL Database

1. Open **XAMPP Control Panel**.
2. Start **Apache** and **MySQL**.
3. Open **http://localhost/phpmyadmin**.
4. Click **New**.
5. Create a database using:

CREATE DATABASE IF NOT EXISTS ehms
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create a dedicated application user
CREATE USER IF NOT EXISTS 'hms_user'@'localhost'
IDENTIFIED BY 'password123';

-- Grant privileges to the user
GRANT ALL PRIVILEGES
ON ehms.*
TO 'hms_user'@'localhost';

-- Apply the changes
FLUSH PRIVILEGES;


## 4. Generate a JWT Secret

Generate a random secret (minimum 32 characters), for example:

```text
JWT_SECRET=Z7mP4vNx8Qk2Ld9Hc5Rt1Yb6Wa3Fs0JuEp8XgK2Vm9Cn4Dh5Qr7Sz1Lt6Bj0MwYUf
```

---

## 5. Configure the .env File

1. Copy `env.example` and rename the copy to `.env`.
2. Open `.env`.
3. Enter your database details and JWT secret.

Example:

```env
DB_URL=jdbc:mysql://localhost:3306/ehms
DB_USERNAME=root
DB_PASSWORD=
JWT_SECRET=your_generated_jwt_secret
```

---

## 6. Run the Backend

1. Install the **EnvFile** plugin in IntelliJ IDEA.
2. Enable the `.env` file in the Run Configuration.
3. Run `EhmsApplication.kt`.

Note for SQL database :-> Option 1) On the first run, Spring Boot will automatically create all database tables and insert the initial system data.
Option 2) you can import the database named ehms.sql inside project folder before running the ehmsApplication.kt as well
---

## 7. Run the Frontend

Open a terminal inside the frontend folder.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```
npm install -g concurrently
Open:

- Backend: http://localhost:8080
- Frontend: http://localhost:3000
example :-> 
E:\ehms\frontend>npm install
E:\ehms\frontend>npm run dev

