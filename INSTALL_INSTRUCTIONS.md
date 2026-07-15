# EHMS enhancement installation

Copy the contents of this folder into the root of the EHMS repository and allow the listed files to overwrite existing files.

## 1. Remove tracked node_modules

Run from the repository root:

```powershell
git rm -r --cached frontend/node_modules
git add .gitignore frontend/.gitignore
git commit -m "Remove frontend node_modules and secure local files"
git push
```

`npm install` will recreate `frontend/node_modules` locally. Do not add it to Git again.

## 2. Set backend environment variables

The new `application.properties` does not contain a real database password or JWT secret.

For the current PowerShell window:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/hms_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Tokyo"
$env:DB_USERNAME="hms_user"
$env:DB_PASSWORD="YOUR_REAL_DATABASE_PASSWORD"
$env:JWT_SECRET="USE_A_RANDOM_SECRET_WITH_AT_LEAST_32_CHARACTERS"
$env:CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

Then run:

```powershell
.\mvnw.cmd clean compile
.\mvnw.cmd spring-boot:run
```

Because the old password and JWT secret were committed publicly, change/rotate both values. Removing them from the latest file does not remove them from Git history.

## 3. Build the frontend

```powershell
cd frontend
npm install
npm run build
npm run dev
```

## 4. Database update

`spring.jpa.hibernate.ddl-auto=update` adds the new user profile columns and the `department_id` relationship. The new columns are nullable at database level to allow existing installations to upgrade. API validation requires all profile fields for newly created users.

## 5. Dashboard earnings

No dashboard replacement is included. The current dashboard already calls `/api/dashboard/earnings` only when `isAdmin` is true.
