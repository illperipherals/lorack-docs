---
sidebar_position: 1
title: Development Procedure
description: Standard development workflow for the LoRACK! mobile application
unlisted: true
---

# LoRACK! Mobile App - Development Procedure

This document outlines the standard development workflow for the LoRACK! (LoRACK) mobile application.

## Project Overview

LoRACK! is a React Native + Expo cross-platform mobile app that provides a mobile interface for:
- **ChirpStack LoRaWAN Network Server** (gRPC-Web)
- **MoD AI services** (REST/JSON API) for AI-powered features

## Development Environment Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/illperipherals/LoRACK-AI-mobile.git
cd LoRACK-AI-mobile/mobile

# Install dependencies
npm install

# Start development server
npm start
```

## Common Development Commands

### Running the App
```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
```

### Code Quality
```bash
npm run lint       # Run ESLint
npm test           # Run Jest tests
npx tsc --noEmit   # TypeScript type checking
```

### Proto/gRPC Generation
```bash
npm run proto:fetch    # Fetch latest proto files from ChirpStack repo
npm run proto:gen      # Generate TypeScript gRPC clients
npm run proto:all      # Fetch and generate in one command
```

## Standard Development Workflow

### 1. Create Feature Branch (Optional)
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Edit code in `src/` directory
- Follow existing patterns and TypeScript conventions
- Ensure proper error handling and loading states

### 3. Test Changes
```bash
# Test on platform(s)
npm run android
npm run ios

# Check for type errors
npx tsc --noEmit

# Run tests if applicable
npm test
```

### 4. Stage and Commit Changes
```bash
# Check status
git status

# Stage files
git add <files>

# Commit with descriptive message
git commit -m "feat: description of feature

- Bullet point detail 1
- Bullet point detail 2

Benefits:
- Benefit 1
- Benefit 2"
```

### 5. Push to Remote
```bash
# Push to origin
git push origin master
# or for feature branch:
git push origin feature/your-feature-name
```

## Commit Message Convention

Follow conventional commits format:

```
<type>: <short description>

<detailed description>

<benefits/notes>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring
- `docs:` Documentation changes
- `style:` Formatting/styling
- `test:` Adding tests
- `chore:` Maintenance tasks

**Example:**
```
feat: integrate Frames and Events into Device Details More tab

- Add DeviceFramesTab component for live LoRaWAN frame streaming
- Add DeviceEventsTab component for live device event streaming
- Refactor Device Details More tab with view selector
- Keep device name visible in fixed header

Benefits:
- Device context always visible
- Better UX with inline navigation
- Improved screenshots with context
```

## Building for Production

### Android APK Build
```bash
# Ensure you're logged into EAS
eas whoami

# Trigger build
eas build --platform android --profile preview

# Or for production
eas build --platform android --profile production
```

### iOS Build
```bash
eas build --platform ios --profile preview
```

### Check Build Status
```bash
eas build:list --platform android --limit 5
```

## Code Organization

### Directory Structure
```
src/
├── components/           # Reusable UI components
│   ├── charts/          # Chart components
│   ├── device-tabs/     # Device detail tab components
│   └── ...
├── contexts/            # React Context providers
├── generated/           # Generated gRPC clients (gitignored)
├── navigation/          # Navigation configuration
├── screens/             # Screen components
├── services/            # API clients and business logic
└── types/               # TypeScript type definitions
```

### Key Patterns
- **Service Layer**: Centralized API clients (`chirpstack-grpc.ts`, `modencode-*-rest.ts`)
- **Context Providers**: Global state (ActiveProfile, Theme, MoD)
- **Navigation**: React Navigation with Stack Navigator
- **Styling**: StyleSheet with theme colors
- **State Management**: Local component state + Context API

## Documentation

When making significant changes:

1. **Update existing docs** in `docs/` directory if relevant
2. **Create new docs** for new features or architectural changes
3. **Update WARP.md** if there are important patterns or conventions to note
4. **Add inline code comments** for complex logic

### Documentation Files
- `docs/device-frames-events.md` - Frames/Events embedding feature
- `docs/development-procedure.md` - This file
- `WARP.md` - Project guidance for AI assistance

## Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
npm start -- --reset-cache
```

**iOS build issues:**
```bash
cd ios && pod install && cd ..
```

**Proto generation issues:**
```bash
npm run proto:clean
npm run proto:all
```

**Type errors in generated code:**
- These are usually in `node_modules` and can be ignored
- Focus on fixing errors in `src/` directory

## Release Checklist

- [ ] All tests passing
- [ ] No TypeScript errors in `src/`
- [ ] Tested on iOS and Android
- [ ] Version bumped in `package.json` and `app.json`
- [ ] Changelog updated (if applicable)
- [ ] Documentation updated
- [ ] Code committed and pushed
- [ ] EAS build triggered
- [ ] Build artifacts tested

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [ChirpStack Documentation](https://www.chirpstack.io/docs/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## Contact

For questions or issues:
- Project Repository: https://github.com/illperipherals/LoRACK-AI-mobile
- ChirpStack: https://www.chirpstack.io/
