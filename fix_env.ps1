$env:CI = "1"

$vars = @{
    "NEXT_PUBLIC_FIREBASE_API_KEY"             = "AIzaSyBlIVfwTucS_bJbozwUEA2GeEXweE4U84w";
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"         = "es-english-academy.firebaseapp.com";
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"          = "es-english-academy";
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"      = "es-english-academy.firebasestorage.app";
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" = "622885190097";
    "NEXT_PUBLIC_FIREBASE_APP_ID"              = "1:622885190097:web:91192fcd33e597246d48f0";
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"      = "G-L70X6BFT1H"
}

$targets = @("production", "preview", "development")

foreach ($key in $vars.Keys) {
    Write-Host "Fixing $key details..."
    foreach ($target in $targets) {
        Write-Host "  -> Removing from $target..."
        # Ignore errors if key doesn't exist
        vercel env rm $key $target -y 2>$null

        Write-Host "  -> Adding to $target..."
        # Pipe cleanly via Node to avoid invisible chars
        node -e "process.stdout.write('${vars[$key]}')" | vercel env add $key $target
    }
}

Write-Host "All keys processed. Triggering DEPLOY..."
vercel --prod
