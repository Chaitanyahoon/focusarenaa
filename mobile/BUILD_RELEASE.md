# Mobile Build and Release

This mobile app is configured to build from GitHub with Expo Application Services (EAS).

## What the repo now contains

- `mobile/eas.json`
  - `preview` Android profile builds an installable `.apk`
  - `production` Android profile builds a Play Store `.aab`
- `.github/workflows/mobile-release.yml`
  - manual GitHub workflow to trigger Android builds
  - optional GitHub Release creation for preview APKs

## One-time setup still required

GitHub cannot complete EAS builds until the Expo project is initialized once from a machine logged into Expo.

Run this from `mobile/`:

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```

That first successful local EAS build handles the required Expo-side bootstrap:

- creates/links the EAS project
- writes the Expo `projectId` into app config if needed
- provisions Android signing credentials

## GitHub secret required

Add this repository secret in GitHub:

- `EXPO_TOKEN`
  - create it from your Expo account
  - used by GitHub Actions to authenticate with EAS

## How to trigger a build on GitHub

Open `Actions` -> `Mobile Android Release` -> `Run workflow`.

Inputs:

- `profile=preview`
  - builds an Android APK for testing
  - can create a GitHub Release and attach the APK
- `profile=production`
  - builds an Android AAB for store distribution
  - uploads metadata as an artifact

## Important note

This workflow is ready in the repo, but it will fail until the one-time Expo/EAS bootstrap above has been completed and `EXPO_TOKEN` has been added in GitHub.
