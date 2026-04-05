# Kanpla API

See what's for lunch at your Kanpla canteen.

## Installation

```bash
    npm install @taulo1999/kanpla-api
```

```bash
    yarn add @taulo1999/kanpla-api
```

## Setup

The extension requires four preferences, configured on the first launch.

| Preference             | Where to find it           |
| ---------------------- | -------------------------- |
| **Email**              | Your Kanpla login email    |
| **Password**           | Your Kanpla login password |
| **Firebase API Key**   | See below                  |
| **Firebase Module ID** | See below                  |

### Finding the Firebase API Key and Module ID

These values aren't exposed in the Kanpla UI, so you'll need to grab them from network traffic:

1. Open [app.kanpla.dk](https://app.kanpla.dk/app) in your browser
2. Open DevTools → **Network** tab
3. Filter requests by `frontend`
4. Find the request to the `/frontend` endpoint
5. From the **request headers**, copy:
   - **x-goog-api-key** — looks like `AIzaSyB...`
6. From the **response body**, search for:
   - **moduleId** — the ID of the menu module for your canteen

### Create a .env file with the values

```text
    FIREBASE_API_KEY=<firebase-api-key>
    FIREBASE_KANPLA_EMAIL=<kanpla-email>
    FIREBASE_KANPLA_PASSWORD=<kanpla-password>
    FIREBASE_MODULE_ID=<firebase-module-id>
```

## Example

```typescript
import Kanpla from "@taulo1999/kanpla-api";

const kanpla = new Kanpla({
  email: process.env.FIREBASE_KANPLA_EMAIL as string,
  password: process.env.FIREBASE_KANPLA_PASSWORD as string,
  firebaseAPIKey: process.env.FIREBASE_API_KEY as string,
  firebaseModuleId: process.env.FIREBASE_MODULE_ID as string,
});

const menu = await kanpla.getMenusByDate(new Date("2026-04-01"));

console.log("Menu from date: 2026-04-01", menu);
```
