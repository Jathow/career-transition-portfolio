# Email Setup (Verification Links)

Goal: send a verification email after user registration with a link to `/api/auth/verify-email?token=...`.

What you need
- App URL: set `APP_BASE_URL` (e.g., `https://yourapp.com` or `http://localhost:5001` in dev)
- Sender address: `FROM_EMAIL` (e.g., `no-reply@yourdomain.com`)
- One provider below (choose one) and its env keys

Option A — Resend (recommended)
1) Create account at https://resend.com and get `RESEND_API_KEY`
2) Verify your domain and set `FROM_EMAIL` to a domain sender
3) Add to server `.env`:
```
APP_BASE_URL=https://yourapp.com
FROM_EMAIL=no-reply@yourdomain.com
RESEND_API_KEY=your_resend_key
EMAIL_PROVIDER=resend
```

Option B — Brevo (Sendinblue)
1) Create account at https://www.brevo.com and get `BREVO_API_KEY`
2) Verify sender/domain
3) `.env`:
```
APP_BASE_URL=https://yourapp.com
FROM_EMAIL=no-reply@yourdomain.com
BREVO_API_KEY=your_brevo_key
EMAIL_PROVIDER=brevo
```

Option C — SMTP (generic)
1) Use your provider’s SMTP values (e.g., Gmail app password, Mailgun SMTP)
2) `.env`:
```
APP_BASE_URL=https://yourapp.com
FROM_EMAIL=no-reply@yourdomain.com
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.yourhost.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_password
SMTP_SECURE=false
```

How it works
- On register, the server generates a token and expects an email to be sent with:
  - Subject: “Verify your email”
  - Link: `${APP_BASE_URL}/api/auth/verify-email?token=...`
- When the user clicks, the server marks the account verified.

Enforcement (optional)
- To require verification before accessing protected routes, set:
```
REQUIRE_VERIFIED_EMAIL=true
```

Local/dev tips
- Use `APP_BASE_URL=http://localhost:5001`
- If you don’t wire a provider yet, you can log the link in the server (temporary) and paste in browser.


