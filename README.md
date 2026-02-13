# HabitForge 🔥

A habit tracking mobile app built with Expo, React Native, Convex, and Clerk.

## Tech Stack

- **Frontend**: Expo (SDK 53) + React Native + TypeScript
- **Backend**: Convex (realtime database + serverless functions)
- **Auth**: Clerk (authentication)
- **Navigation**: React Navigation

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Convex account (<https://convex.dev>)
- Clerk account (<https://clerk.com>)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Convex
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Clerk JWT Template Setup (Required)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Configure → JWT Templates**
3. Click **New Template** and select **Convex**
4. Keep the name as `convex` (do NOT rename)
5. Copy the **Issuer** URL
6. Add it to Convex environment variables:
   - Go to [Convex Dashboard](https://dashboard.convex.dev)
   - Select your project → **Settings → Environment Variables**
   - Add `CLERK_JWT_ISSUER_DOMAIN` with your Clerk Issuer URL

### Installation

```bash
# Install dependencies
npm install

# Start Convex dev server (in a separate terminal)
npm run convex:dev

# Start Expo dev server
npm start
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run convex:dev` | Start Convex dev server with live sync |
| `npm run convex:deploy` | Deploy Convex to production |
| `npm run android` | Start on Android |
| `npm run ios` | Start on iOS |
| `npm run lint` | Run ESLint |

## Project Structure

```
├── App.tsx                    # Entry point with providers
├── convex/                    # Convex backend
│   ├── schema.ts              # Database schema
│   ├── auth.ts                # Auth helpers
│   ├── auth.config.ts         # Clerk JWT config
│   └── habits.ts              # Queries and mutations
├── src/
│   ├── screens/               # App screens
│   ├── hooks/
│   │   └── useConvexHabits.ts # Convex React hooks
│   ├── providers/
│   │   └── ConvexClerkProvider.tsx
│   ├── lib/
│   │   └── convex.ts          # Convex client
│   ├── data/                  # Legacy AsyncStorage (fallback)
│   ├── navigation/            # React Navigation
│   └── theme/                 # Theme and colors
└── .env.local                 # Environment variables
```

## Database Schema

### Tables

- **users**: User records linked to Clerk
- **habits**: User habits with schedule configuration
- **habitEntries**: Daily completion records

### Security

All data access is protected by ownership checks:

- Server functions extract `userId` from the authenticated JWT
- No `userId` is passed from the client
- Each query/mutation verifies the user owns the requested resource

## Features

- ✅ User authentication (sign up, sign in, sign out)
- ✅ Create, edit, archive, and delete habits
- ✅ Daily habit tracking with realtime updates
- ✅ Dark/light theme support
- ✅ Offline fallback to local storage (when not authenticated)
- ✅ Streak tracking
- ✅ Push notifications (local)

## Development

### Seed Sample Data (Dev Only)

When authenticated and the habit list is empty, a "Seed Sample Habits" button appears in dev mode.

### Auth Debug Banner

In dev mode, a banner shows the current auth status:

- 🟢 **Convex**: Connected to Convex with authenticated user
- 🟡 **Local Storage**: Using local AsyncStorage (not authenticated)

## Deployment

### Convex Production

```bash
npm run convex:deploy
```

### Expo Production Build

```bash
npm run deploy
```

## Links

- [Convex Dashboard](https://dashboard.convex.dev)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [Expo Documentation](https://docs.expo.dev)
