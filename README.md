# MiniLedger

MiniLedger is a loan management application that allows users to authenticate using OTP, manage loans, track repayments, and view a financial summary. It uses a Node.js and TypeScript backend, PostgreSQL hosted on Supabase, and a React Native application built with Expo.

## Features

- **OTP Authentication:** Authenticate users using their phone number and OTP.
- **Loan Management:** Create and view loan records.
- **Repayment Tracking:** Mark loans as repaid.
- **Financial Summary:** View an overview of loan-related information.
- **Cloud Database:** Store application data using Supabase-hosted PostgreSQL.
- **REST API:** Communicate between the mobile application and backend through HTTP APIs.

## Tech Stack

| Component | Technology |
|---|---|
| Mobile application | React Native, Expo, TypeScript |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| Database hosting | Supabase |
| Backend hosting | Render |
| Authentication | OTP-based authentication |

## Project Structure

```text
miniledger/
├── backend/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
└── mobile/
    ├── App.tsx
    ├── app.json
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── api.ts
        ├── config.ts
        └── screens/
```

*Note: The structure above is representative. Your repository may contain additional files and folders.*

## Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) — preferably an LTS version.
- npm, which is included with Node.js.
- [Expo Go](https://expo.dev/go/) if you want to test on a compatible physical device.
- A Supabase account and PostgreSQL database, if running your own backend locally.

You do not need to install PostgreSQL locally when using your Supabase-hosted database.

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd miniledger
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your repository's Git URL.

## 2. Configure the Backend

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory.

Example configuration:

```env
PORT=4000
DATABASE_URL=your_supabase_postgresql_connection_string
JWT_SECRET=your_secure_secret
```

Configure any additional environment variables required by your backend, including OTP provider credentials if applicable.

### Configure Supabase

1. Create a project in [Supabase](https://supabase.com/).
2. Open the project's database connection settings.
3. Obtain a suitable PostgreSQL connection string.
4. Add the connection string to `DATABASE_URL` in your backend `.env` file.
5. Ensure the database schema and required tables are created using the project's migrations or schema setup instructions, if applicable.

**Important:** Use the connection method appropriate for your hosting environment. A Supabase session pooler may be suitable when a direct database connection is not supported by the network.

Never commit your `.env` file, database credentials, JWT secret, or other private credentials to GitHub.

### Start the Backend

Run the backend development server:

```bash
npm run dev
```

If configured successfully, the backend should start on the port specified by your environment configuration.

For production deployment, use the start command configured in the backend's `package.json`.

## 3. Configure the Mobile Application

Open another terminal from the project root:

```bash
cd mobile
npm install
```

Configure the mobile application's API base URL in the appropriate configuration file, such as `src/config.ts`.

For the deployed backend, use your deployed API URL:

```ts
export const API_URL = "https://your-backend.onrender.com";
```

Replace the example URL with the actual backend URL.

If you are running the backend locally, use an address appropriate for your testing environment:

- **Android emulator:** `http://10.0.2.2:4000`
- **iOS simulator:** `http://localhost:4000`
- **Physical device:** Use your computer's local network IP address and ensure both devices can reach the backend.

Make sure the backend is running and reachable before testing API requests.

## 4. Run the Mobile Application

From the `mobile` directory, run:

```bash
npx expo start
```

You can then:

- Scan the QR code using Expo Go on a compatible physical device.
- Press `a` to open the Android emulator, if configured.
- Press `i` to open the iOS simulator on macOS, if configured.
- Press `w` to run the web version if the required web dependencies are installed and the application supports web.

To clear the Metro cache if necessary:

```bash
npx expo start --clear
```

## 5. API Endpoints

The backend exposes the following application endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/request-otp` | Request an OTP |
| POST | `/auth/verify-otp` | Verify an OTP |
| GET | `/loans` | Retrieve loans |
| GET | `/summary` | Retrieve the financial summary |
| POST | `/loans` | Create a loan |
| POST | `/loans/:id/repay` | Mark a loan as repaid |

Authenticated endpoints require the appropriate bearer token in the request headers.

Example:

```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```

The exact request body, response structure, and authentication requirements are defined by the backend implementation.

## 6. Deployment

The application can be deployed using the following services:

- **Backend:** Render
- **Database:** Supabase PostgreSQL
- **Mobile application:** Run through Expo or build for the target platform.

For deployment, configure environment variables securely in the hosting provider's dashboard. Ensure the deployed backend connects to the correct Supabase database and that the mobile application points to the deployed API URL.

## Troubleshooting

### Database connection errors

- Verify that `DATABASE_URL` is correct.
- Confirm that the database is reachable from the backend host.
- Check whether the selected Supabase connection method is supported by the hosting environment.
- Verify that the database schema has been initialized.

### OTP verification fails

- Confirm that the phone number and OTP are correct.
- Check the backend logs for authentication errors.
- Verify the OTP provider configuration and expiration rules, if applicable.

### Mobile application cannot reach the backend

- Confirm that `API_URL` points to the correct server.
- Ensure the backend is running and reachable.
- For local development, use the correct network address for your emulator or physical device.

### Expo web errors

Install the web dependencies if web support is required:

```bash
npx expo install react-native-web react-dom @expo/metro-runtime
```

## Security Notes

- Never commit environment files or database credentials.
- Use a strong, private JWT secret.
- Validate user input on the backend.
- Protect authenticated endpoints and verify access permissions.
- Do not expose privileged database credentials in the mobile application.

## License

Add a license to this repository if you intend to distribute the project under specific reuse terms.
