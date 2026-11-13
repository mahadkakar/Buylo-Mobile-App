# Buylo (mobile app)

Buylo compares grocery prices in Canada. You build a basket, and the app shows what it would cost at Metro, Food Basics and
Walmart, suggests cheaper brands and same-product alternatives, and lets you save baskets.

This repository is the mobile app. The API it talks to is in the separate **Buylo-Backend** repository
(`https://github.com/mahadkakar/Buylo-Backend`).

## Stack

- Expo SDK 58, React Native 0.88, React 19
- Expo Router (file based navigation, drawer + stack)
- NativeWind (Tailwind CSS for React Native)
- TanStack React Query (server state and caching) and Zustand (basket and UI state)
- Supabase Auth (email, plus Google and Apple sign in) for accounts; prices and products come from the Buylo API

## Getting started

Requirements: Node 22 (see `.nvmrc`) and the Expo Go app on a phone, or an Android emulator / iOS simulator.

```bash
npm install
cp .env.example .env     # then fill in the values below
npx expo start           # add -c to clear the Metro cache after changing .env
```

Scan the QR code with Expo Go, or press `a` (Android emulator) / `i` (iOS simulator).

### Environment variables

Variables prefixed `EXPO_PUBLIC_` are read when the app is bundled, so restart Expo with `-c` after changing them. They end up
inside the app, so never put a secret in them.

| Variable | What it is |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase public (anon) key |
| `EXPO_PUBLIC_API_URL` | Base URL of the Buylo API, e.g. `https://buylo-backend-ly5d.onrender.com`. For a local backend on a physical device use the computer's LAN address (`http://192.168.x.x:8000`), not `localhost`; the Android emulator reaches the host at `http://10.0.2.2:8000`. |

## Project structure

```
src/
  app/          screens and routes (Expo Router): (drawer) home, categories, basket, saved baskets, profile;
                product, comparison results, retailer basket, swaps, search, settings, sign in / sign up
  api/          API client and React Query hooks (products, comparison, account, Supabase)
  components/   shared UI (product cards, sidebar, bottom bar, dialogs, motion helpers)
  store/        Zustand stores (basket, UI)
  lib/          helpers (session, location, sizes, cache times, haptics, social sign in)
  constants/    categories, retailers, images
  theme/        colours and shadows
  legal/        privacy policy and terms (JSON, rendered in the app)
scripts/        build-legal-site.js: generates the public privacy / terms pages from the same JSON
assets/         icons, splash, brand images
```

## Legal pages

The privacy policy and terms are stored in `src/legal/*.json` and shown in the app. To generate the public web versions:

```bash
LEGAL_SUPPORT_EMAIL=you@example.com node scripts/build-legal-site.js docs
```

## Building for the stores

`eas.json` holds the EAS Build profiles (`development`, `preview`, `production`). Builds run with EAS, which does not see
your local `.env`: set the three `EXPO_PUBLIC_` variables in the EAS project's environment variables (or in the profile's
`env`) before building. App identifiers, store accounts and signing are configured as part of the release setup.
