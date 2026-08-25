# Backend Auth API

## Setup
1. Copy `.env.example` to `.env`.
2. Fill MongoDB, JWT secret, Gmail address and Google App Password.
3. Run `npm install`.
4. Run `npm run dev`.

Backend default: http://localhost:5000

## Auth flow
- Register: name + email -> OTP -> verify -> set password
- Login: email + password OR email + OTP
- JWT expires in 1 day
- OTP expires in 10 minutes
- Maximum 3 resends while the current OTP session is active; the next resend is blocked until expiry
- Email has a unique MongoDB index
