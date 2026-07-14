# EHMS exact Vite-to-Next.js conversion

This conversion keeps your current GitHub frontend design and source concepts intact.

The public repository currently uses Vite scripts, React Router, React pages/components, and the existing Vision HMS CSS theme. The conversion deliberately keeps the SPA architecture and only changes the development/build/runtime module to Next.js.

## Files in this package

- `Convert-EhmsFrontendToNext.ps1` — creates the complete Next.js frontend from your existing Vite frontend.
- `Convert-Current-EHMS.cmd` — convenient Windows launcher.

## Recommended command

Open PowerShell in this conversion-kit folder:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\Convert-EhmsFrontendToNext.ps1 `
  -SourceFrontend "D:\Web 3.0\ehms\frontend" `
  -OutputFrontend "D:\Web 3.0\ehms\frontend-next" `
  -Force
```

Then:

```powershell
cd "D:\Web 3.0\ehms\frontend-next"
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Backend CORS must allow Next.js:

```properties
app.cors.allowed-origins=http://localhost:3000
```

## Preserved exactly

- `src/components`
- `src/pages`
- `src/context`
- `src/hooks`
- `src/services`
- `src/utils`
- all CSS files and CSS rules
- React Router route definitions
- authentication and role concepts
- REST API endpoints
- Fetch/AJAX logic
- dashboard, patients, setup, billing, users, password pages

## Changed only for Next.js compatibility

- `package.json` scripts and Next dependency
- Vite environment syntax to Next public environment syntax
- CSS import location required by Next.js
- entry point and HTML shell
- Vite config/index removal in the generated output

The original `main.jsx` is retained in the generated folder as `main.vite-reference.jsx`.
