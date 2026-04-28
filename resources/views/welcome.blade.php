<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Pawtastic</title>
    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
    <link href="https://fonts.googleapis.com/css2?family=Akaya+Kanadaka&family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
</head>
<body>
    <div id="sam-virtudazo"></div>
    <script>
        window.__PETVERSE__ = @json([
            'pendingVerificationEmail' => $pendingVerificationEmail ?? null,
        ]);
    </script>
    <script src="{{ mix('js/app.js') }}"></script>
</body>
</html>