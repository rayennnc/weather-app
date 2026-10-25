# WeatherApp

A weather app for Android, built with plain React Native (no Expo) and TypeScript. It shows current conditions, a 48-hour forecast and a 7-day forecast for your location or any city you search for, and keeps showing the last fetched data when you are offline.

This is a portfolio project. It is not published to any app store.

[![CI](https://github.com/rayennnc/weather-app/actions/workflows/ci.yml/badge.svg)](https://github.com/rayennnc/weather-app/actions/workflows/ci.yml)

> **Status:** work in progress. The repository foundation is in place (tooling, CI, base structure). Features are built milestone by milestone.

## Features

Planned, and ticked off as they are built:

- [ ] Current weather: temperature, condition, feels-like, humidity, wind and precipitation
- [ ] Hourly forecast (next 48 hours) and daily forecast (7 days)
- [ ] Device location with a city search fallback, plus saved locations
- [ ] Unit settings (°C/°F, km/h or mph)
- [ ] Offline support: the last data stays visible with a "last updated" label
- [ ] Loading, error, empty and permission-denied states

## Tech stack

In place:

- React Native 0.88 (Community CLI, New Architecture) and TypeScript (strict)
- ESLint, Prettier and Jest
- GitHub Actions (lint, type check, format check, test)

Planned: React Navigation 7, TanStack Query, Zustand, Zod, React Native Testing Library.

## Architecture

MVVM with hooks, organized by feature:

- **View**: screens and components, which only render and call callbacks
- **ViewModel**: one custom hook per screen, which combines server state and UI state
- **Model**: repository, API client, schema validation and mappers

```text
src/
  app/          app shell: entry, navigation, providers
  features/
    weather/    data/ hooks/ ui/
    search/
    locations/
    settings/
  shared/       ui/ utils/ theme/ lib/ stores/
```

Folders are created as each feature is built; only `src/app` exists so far. Imports only flow in one direction: `shared` → `features` → `app`.

## Getting started

Prerequisites:

- Node.js 22.11 or newer (CI uses 24 LTS)
- JDK 17
- Android Studio with Android SDK Platform 37, Build-Tools 37.0.0 and NDK 27.1.12297006
- An Android emulator, or a device with USB debugging

See the [React Native environment setup guide](https://reactnative.dev/docs/set-up-your-environment) for details.

```sh
npm ci
npm start
# in a second terminal
npm run android
```

## Scripts

| Command                | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `npm start`            | Start the Metro development server                   |
| `npm run android`      | Build and run the Android app                        |
| `npm run check`        | Lint, type check, format check and test (same as CI) |
| `npm run lint`         | Run ESLint                                           |
| `npm run typecheck`    | Run the TypeScript compiler without emitting files   |
| `npm run format:check` | Check formatting with Prettier                       |
| `npm run format`       | Format all files with Prettier                       |
| `npm test`             | Run Jest tests                                       |

## Data sources

Weather data is provided by [Open-Meteo](https://open-meteo.com/). Place search uses the Open-Meteo Geocoding API (data from [GeoNames](https://www.geonames.org/)). Open-Meteo's free API is for non-commercial use and has rate limits, and its data is licensed under CC BY 4.0, so attribution is required. See their [terms](https://open-meteo.com/en/terms).
