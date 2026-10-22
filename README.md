# MiniLedger

A small app to track money lent to friends.

- Backend: Node.js, TypeScript, Express, PostgreSQL
- App: React Native (Expo)
- Bonus: receipt photo upload, input validation, basic tests

## What you need
- Node.js 18+
- Docker (for Postgres) or a local PostgreSQL
- Expo Go on your phone, or an Android emulator / iOS simulator

## Run it

1. Start Postgres
```
docker compose up -d
```
This creates a database called `miniledger` (user and password are both `postgres`).
If you use your own Postgres, set `DATABASE_URL` before starting the backend.

2. Start the backend
```
cd backend
npm install
npm run dev
```
The server runs on http://localhost:4000 and creates the tables by itself.
The OTP is printed in this terminal when you ask for it.

3. Start the app
```
cd mobile
npm install
npx expo start
```
Press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

If you use a real phone, open `mobile/src/config.ts` and put your computer's IP address there, for example `http://192.168.1.5:4000`.

## How to use
1. Enter your phone number and tap Send OTP
2. Look at the backend terminal, copy the OTP, enter it and tap Login
3. Tap + to add an entry (friend name, amount, due date, optional receipt photo)
4. Overdue entries are shown in red
5. Tap Mark repaid when a friend pays back
6. The card at the top shows total lent, total repaid and overdue amount

## API

| Method | Path | Body | What it does |
|---|---|---|---|
| POST | /auth/request-otp | phone | prints a 6 digit OTP in the server log |
| POST | /auth/verify-otp | phone, otp | returns a token |
| GET | /loans | | list of your entries |
| POST | /loans | friendName, amount, dueDate, receipt (optional image) | add an entry |
| POST | /loans/:id/repay | | mark as repaid |
| GET | /summary | | totalLent, totalRepaid, overdueAmount |

Send the token as `Authorization: Bearer <token>` for everything except the two auth routes.

## Tests
```
cd backend
npm test
```

## Notes
- OTPs are kept in memory, so they are lost if the server restarts
- An entry is overdue when it is not repaid and its due date is before today
- Receipt photos are saved in `backend/uploads`
