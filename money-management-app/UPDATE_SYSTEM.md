# PWA Update System

This document explains how the manual update system works in the Money Management App.

## Overview

The app now includes a manual update system that allows users to check for and install updates on demand, rather than relying on automatic updates.

## How It Works

### 1. Version Management
- Version is managed in `package.json`
- During build, the version is injected into `src/version.ts`
- The update service reads the version from this file

### 2. Update Service
- Located in `src/services/updateService.ts`
- Handles service worker registration and update detection
- Provides methods to check for updates and apply them
- Uses Workbox for service worker management

### 3. User Interface
- Update controls are in the Settings page
- Users can manually check for updates
- Visual feedback shows update status
- Install button appears when updates are available

## Usage

### For Users
1. Go to Settings page
2. Scroll to "App Updates" section
3. Click "Check for Updates" to check for new versions
4. If an update is available, click "Install Update"
5. The app will reload with the new version

### For Developers

#### Releasing a New Version
1. Update the version in `package.json`:
   ```bash
   npm run version:patch  # for bug fixes (1.0.0 -> 1.0.1)
   npm run version:minor  # for new features (1.0.0 -> 1.1.0)
   npm run version:major  # for breaking changes (1.0.0 -> 2.0.0)
   ```

2. Build and deploy:
   ```bash
   npm run build
   ```

3. Deploy the built files to your server

#### How Updates Are Detected
- Service worker checks for new files during update check
- If new files are found, they are downloaded and cached
- User is notified that an update is available
- When user clicks "Install Update", the new service worker takes control
- Page reloads to use the new version

## Technical Details

### Service Worker Configuration
- Uses `registerType: 'prompt'` instead of `autoUpdate`
- This prevents automatic updates and gives users control
- Service worker handles caching and update detection

### Update Flow
1. User clicks "Check for Updates"
2. Service worker checks for new files
3. If updates found, they're downloaded to cache
4. User sees "Install Update" button
5. User clicks "Install Update"
6. Service worker sends SKIP_WAITING message
7. New service worker takes control
8. Page reloads with new version

### Files Modified
- `src/services/updateService.ts` - New update service
- `src/pages/Settings.tsx` - Added update UI
- `src/main.tsx` - Initialize update service
- `src/version.ts` - Version injection point
- `scripts/inject-version.js` - Build script for version injection
- `vite.config.ts` - Changed to prompt-based updates
- `package.json` - Added version scripts

### Translation Support
- All update-related text is translatable
- Supports both English and Persian
- Translation keys in `src/i18n/locales/`

## Benefits

1. **User Control**: Users decide when to update
2. **Transparency**: Clear feedback about update status
3. **Reliability**: Manual updates are more predictable
4. **Version Tracking**: Proper version management
5. **Offline Support**: App works offline with cached data
6. **Seamless Experience**: Updates don't interrupt workflow

## Testing Updates

To test the update system:

1. Build and deploy version 1.0.0
2. Make changes to the app
3. Update version to 1.0.1 in package.json
4. Build and deploy the new version
5. Open the app and check for updates
6. Install the update and verify changes

The update system ensures users always have control over when their app updates while providing a smooth experience for applying new features and fixes.
