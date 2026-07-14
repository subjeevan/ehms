param(
    [Parameter(Mandatory = $true)]
    [string]$SourceFrontend,

    [string]$OutputFrontend = "",

    [switch]$Force
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Set-JsonProperty {
    param(
        [Parameter(Mandatory = $true)]$Object,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)]$Value
    )

    if ($Object.PSObject.Properties[$Name]) {
        $Object.$Name = $Value
    }
    else {
        $Object | Add-Member -NotePropertyName $Name -NotePropertyValue $Value
    }
}

$source = [System.IO.Path]::GetFullPath($SourceFrontend)

if (-not (Test-Path $source)) {
    throw "Source frontend folder was not found: $source"
}

if (-not (Test-Path (Join-Path $source "package.json"))) {
    throw "package.json was not found inside: $source"
}

if (-not (Test-Path (Join-Path $source "src"))) {
    throw "src folder was not found inside: $source"
}

if ([string]::IsNullOrWhiteSpace($OutputFrontend)) {
    $parent = Split-Path $source -Parent
    $OutputFrontend = Join-Path $parent "frontend-next"
}

$output = [System.IO.Path]::GetFullPath($OutputFrontend)

if ($source -eq $output) {
    throw "Source and output folders must be different. Use a separate output folder."
}

if (Test-Path $output) {
    if (-not $Force) {
        throw "Output folder already exists: $output`nUse -Force to replace it."
    }

    Write-Step "Removing existing output folder"
    Remove-Item $output -Recurse -Force
}

Write-Step "Copying the existing Vite frontend without changing its design or business logic"
Copy-Item $source $output -Recurse -Force

$foldersToRemove = @(
    "node_modules",
    "dist",
    ".next"
)

foreach ($folder in $foldersToRemove) {
    $path = Join-Path $output $folder
    if (Test-Path $path) {
        Remove-Item $path -Recurse -Force
    }
}

$filesToRemove = @(
    "package-lock.json",
    "vite.config.js",
    "vite.config.mjs",
    "vite.config.ts",
    "index.html"
)

foreach ($file in $filesToRemove) {
    $path = Join-Path $output $file
    if (Test-Path $path) {
        Remove-Item $path -Force
    }
}

Write-Step "Changing only the build/runtime module from Vite to Next.js"

$packagePath = Join-Path $output "package.json"
$package = Get-Content $packagePath -Raw | ConvertFrom-Json

Set-JsonProperty -Object $package -Name "private" -Value $true
Set-JsonProperty -Object $package -Name "scripts" -Value ([ordered]@{
    dev = "next dev"
    build = "next build"
    start = "next start"
})

if (-not $package.dependencies) {
    Set-JsonProperty -Object $package -Name "dependencies" -Value ([pscustomobject]@{})
}

Set-JsonProperty -Object $package.dependencies -Name "next" -Value "latest"

# Preserve the same React, Chart.js and react-router-dom dependencies.
# Only Vite-specific development dependencies are removed.
if ($package.devDependencies) {
    $package.devDependencies.PSObject.Properties.Remove("vite")
    $package.devDependencies.PSObject.Properties.Remove("@vitejs/plugin-react")
}

$package | ConvertTo-Json -Depth 20 | Set-Content $packagePath -Encoding UTF8

Write-Step "Moving global CSS imports to Next.js _app.js while keeping every CSS rule unchanged"

$srcPath = Join-Path $output "src"
$cssFiles = Get-ChildItem $srcPath -Recurse -File -Filter "*.css" |
    Sort-Object @{
        Expression = {
            if ($_.Name -eq "styles.css") { 0 } else { 1 }
        }
    }, FullName

# Next.js Pages Router requires global CSS to be imported only from pages/_app.js.
# Remove only CSS import statements from source modules. CSS files themselves stay unchanged.
$sourceFiles = Get-ChildItem $srcPath -Recurse -File |
    Where-Object { $_.Extension -in @(".js", ".jsx", ".ts", ".tsx") }

foreach ($sourceFile in $sourceFiles) {
    $content = Get-Content $sourceFile.FullName -Raw

    $updated = [regex]::Replace(
        $content,
        "(?m)^\s*import\s+['""][^'""]+\.css['""]\s*;?\s*\r?\n?",
        ""
    )

    if ($updated -ne $content) {
        Set-Content $sourceFile.FullName $updated -Encoding UTF8
    }
}

Write-Step "Converting Vite public environment variables to Next.js public environment variables"

foreach ($sourceFile in $sourceFiles) {
    $content = Get-Content $sourceFile.FullName -Raw

    $updated = [regex]::Replace(
        $content,
        "import\.meta\.env\.VITE_([A-Z0-9_]+)",
        'process.env.NEXT_PUBLIC_$1'
    )

    if ($updated -ne $content) {
        Set-Content $sourceFile.FullName $updated -Encoding UTF8
    }
}

$pagesPath = Join-Path $output "pages"
New-Item $pagesPath -ItemType Directory -Force | Out-Null

$cssImports = @()
foreach ($cssFile in $cssFiles) {
    $relative = [System.IO.Path]::GetRelativePath($pagesPath, $cssFile.FullName)
    $relative = $relative.Replace("\", "/")

    if (-not $relative.StartsWith(".")) {
        $relative = "./$relative"
    }

    $cssImports += "import '$relative'"
}

$appContent = @"
import Script from 'next/script'
$($cssImports -join "`n")

export default function NextApplication({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.min.js"
        strategy="afterInteractive"
      />
    </>
  )
}
"@

Set-Content (Join-Path $pagesPath "_app.js") $appContent -Encoding UTF8

$documentContent = @'
import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#0f6b78" />
        <meta
          name="description"
          content="Hospital Management System"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
'@

Set-Content (Join-Path $pagesPath "_document.js") $documentContent -Encoding UTF8

$clientEntry = @'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'

/**
 * This file intentionally keeps the original Vite SPA architecture.
 * Next.js provides the development/build/runtime server, while the
 * original React Router routes, context, pages, components and design
 * remain unchanged.
 */
export default function NextClientApplication() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  )
}
'@

Set-Content (Join-Path $srcPath "NextClientApplication.jsx") $clientEntry -Encoding UTF8

$catchAllContent = @'
import dynamic from 'next/dynamic'
import Head from 'next/head'

const NextClientApplication = dynamic(
  () => import('../src/NextClientApplication'),
  {
    ssr: false,
    loading: () => (
      <div className="center-page">
        <div className="center-card">
          <span className="spinner" />
          <p>Loading Vision HMS...</p>
        </div>
      </div>
    )
  }
)

export default function ApplicationRoute() {
  return (
    <>
      <Head>
        <title>Vision HMS</title>
      </Head>
      <NextClientApplication />
    </>
  )
}
'@

Set-Content (Join-Path $pagesPath "[[...slug]].js") $catchAllContent -Encoding UTF8

$nextConfig = @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
}

export default nextConfig
'@

Set-Content (Join-Path $output "next.config.mjs") $nextConfig -Encoding UTF8

$jsConfig = @'
{
  "compilerOptions": {
    "baseUrl": "."
  }
}
'@

Set-Content (Join-Path $output "jsconfig.json") $jsConfig -Encoding UTF8

$envExample = @'
NEXT_PUBLIC_API_URL=http://localhost:8080/api
'@

Set-Content (Join-Path $output ".env.local.example") $envExample -Encoding UTF8

$envLocal = Join-Path $output ".env.local"
if (-not (Test-Path $envLocal)) {
    Set-Content $envLocal $envExample -Encoding UTF8
}

$gitIgnorePath = Join-Path $output ".gitignore"
$gitIgnoreAdditions = @'

# Next.js
.next/
out/
.env.local
'@

if (Test-Path $gitIgnorePath) {
    $gitIgnore = Get-Content $gitIgnorePath -Raw
    if ($gitIgnore -notmatch "(?m)^\.next/") {
        Add-Content $gitIgnorePath $gitIgnoreAdditions -Encoding UTF8
    }
}
else {
    Set-Content $gitIgnorePath $gitIgnoreAdditions.TrimStart() -Encoding UTF8
}

# main.jsx is no longer the runtime entry, but it is retained as an
# untouched reference to the previous Vite entry point.
$legacyMain = Join-Path $srcPath "main.jsx"
if (Test-Path $legacyMain) {
    Rename-Item $legacyMain "main.vite-reference.jsx" -Force
}

$readme = @'
# Vision HMS — Next.js module conversion

This folder was generated from the original Vite frontend.

## What was changed

- Vite was replaced by Next.js.
- `npm run dev` now starts Next.js on port `3000`.
- Vite environment variables were converted:
  - `VITE_API_URL`
  - becomes `NEXT_PUBLIC_API_URL`
- Global CSS imports were moved to `pages/_app.js` because Next.js
  requires global CSS to be imported there.
- The former `index.html` XLSX script is loaded using `next/script`.

## What was not changed

- React components
- Page design
- CSS rules
- AuthContext behavior
- React Router route definitions
- Patient management concepts
- Dashboard concepts
- Billing and Charge Setup concepts
- Fetch/AJAX API contracts
- Client-side validation
- Role-based frontend behavior

The original SPA is mounted inside a Next.js optional catch-all page.
This is the smallest migration and preserves the existing behavior.

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

The backend must run at:

```text
http://localhost:8080
```

Backend CORS:

```properties
app.cors.allowed-origins=http://localhost:3000
```

## Production build

```powershell
npm run build
npm start
```
'@

Set-Content (Join-Path $output "README-NEXT.md") $readme -Encoding UTF8

Write-Step "Conversion completed"
Write-Host "Output: $output" -ForegroundColor Green
Write-Host ""
Write-Host "Next commands:" -ForegroundColor Yellow
Write-Host "  cd `"$output`""
Write-Host "  npm install"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Open http://localhost:3000"
