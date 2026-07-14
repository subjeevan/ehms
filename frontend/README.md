# Vision HMS — Next.js Frontend

This project uses the Next.js App Router with native route folders.

## Run

```powershell
Copy-Item .env.local.example .env.local
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The Spring Boot backend must run at:

```text
http://localhost:8080
```

Backend CORS:

```properties
app.cors.allowed-origins=http://localhost:3000
```

## Main routes

- `/login`
- `/dashboard`
- `/patients`
- `/patients/register`
- `/patients/[id]/edit`
- `/patients/update`
- `/setup`
- `/setup/charges`
- `/users`
- `/change-password`
