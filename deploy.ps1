# Helper script to deploy manually while passing local secrets to Cloud Build
$ErrorActionPreference = "Stop"

if (-not (Test-Path .env.local)) {
    Write-Error ".env.local file not found!"
    exit 1
}

# Extract keys from .env.local
$firebaseKey = Select-String -Path .env.local -Pattern "^FIREBASE_API_KEY=(.+)$" | ForEach-Object { $_.Matches.Groups[1].Value.Trim() }
$geminiKey = Select-String -Path .env.local -Pattern "^GEMINI_API_KEY=(.+)$" | ForEach-Object { $_.Matches.Groups[1].Value.Trim() }

if ([string]::IsNullOrWhiteSpace($firebaseKey) -or [string]::IsNullOrWhiteSpace($geminiKey)) {
    Write-Error "Could not find FIREBASE_API_KEY or GEMINI_API_KEY in .env.local"
    exit 1
}

Write-Host "Found keys in .env.local"
Write-Host "  FIREBASE_API_KEY: ${firebaseKey.Substring(0, 5)}..."
Write-Host "  GEMINI_API_KEY:   ${geminiKey.Substring(0, 5)}..."

# Construct substitutions string
# Note: Cloud Build variables in cloudbuild.yaml are prefixed with _
$subs = "_FIREBASE_API_KEY=$firebaseKey,_GEMINI_API_KEY=$geminiKey"

Write-Host "`nSubmitting build to Google Cloud Build..."
gcloud builds submit --config cloudbuild.yaml --substitutions=$subs .
