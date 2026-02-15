$env:CI = "1"

$vars = @{
    "NEXT_PUBLIC_FIREBASE_API_KEY"             = "AIzaSyA1oFS8KrjQHaD8VPizOMySnpVDnv1Dang";
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"         = "esenglishacad.firebaseapp.com";
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"          = "esenglishacad";
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"      = "esenglishacad.firebasestorage.app";
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" = "712293250318";
    "NEXT_PUBLIC_FIREBASE_APP_ID"              = "1:712293250318:web:5ec896a9cd7b75ba27d35f";
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"      = ""
}

$targets = @("production", "preview", "development")

foreach ($key in $vars.Keys) {
    # If the value is empty, skip adding it (MeasurementID)
    if (-not $vars[$key]) {
        Write-Host "Skipping empty key: $key"
        continue
    }

    Write-Host "Updating $key for new project..."
    foreach ($target in $targets) {
        # Try to remove old key just in case (ignore errors)
        vercel env rm $key $target -y 2>$null

        # Add new key cleanly
        node -e "process.stdout.write('${vars[$key]}')" | vercel env add $key $target
    }
}

Write-Host "All new keys uploaded. Triggering DEPLOY..."
vercel --prod
