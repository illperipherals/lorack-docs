---
sidebar_position: 3
title: Development Gotchas
description: Common pitfalls and non-obvious requirements
---

# LoRACK AI Mobile - Development Gotchas

This document captures common pitfalls and non-obvious requirements discovered during development. Use this to avoid repeating mistakes.

## ChirpStack gRPC-Web API

### Tenant ID Required for Most Operations
**Problem**: `applications.list()` fails with "invalid length 32, found 0" when tenant ID is missing.

**Cause**: ChirpStack requires a valid tenant ID (32-character UUID) for most API calls, even when listing resources.

**Solution**:
```typescript
// ❌ WRONG - Don't call without tenant ID
await api.applications.list(undefined, 10, 0);

// ✅ CORRECT - Always pass tenant ID
await api.applications.list('faa4b011-ad58-40b0-b2e5-b73a01a7da37', 10, 0);
```

**Context**: Error message is misleading - "invalid length 32" refers to tenant ID parameter validation, NOT the JWT token.

### Both Authorization Headers Required
**Problem**: Authentication fails with just one header.

**Cause**: gRPC-Web requires both standard and prefixed authorization headers.

**Solution**:
```typescript
// ❌ WRONG - Only one header
const metadata = {
  'grpc-metadata-authorization': `Bearer ${token}`
};

// ✅ CORRECT - Both headers required
const metadata = {
  'authorization': `Bearer ${token}`,
  'grpc-metadata-authorization': `Bearer ${token}`
};
```

### Port Number Must Be Explicit
**Problem**: Connection fails when port is omitted from HTTPS URLs.

**Cause**: gRPC-Web client doesn't infer default ports.

**Solution**:
```typescript
// ❌ WRONG - Port omitted
const url = 'https://chirpstack.example.com';

// ✅ CORRECT - Always include port
const url = 'https://chirpstack.example.com:443';
const url = 'http://chirpstack.example.com:8080';
```

### Token Whitespace Must Be Stripped
**Problem**: Authentication fails after copy/pasting API tokens.

**Cause**: Clipboard often includes trailing newlines or spaces.

**Solution**:
```typescript
// ✅ Always clean tokens before use
const cleanedToken = apiToken.replace(/\s+/g, '');
```

**Apply in**: Save operations, connection tests, AND client creation.

### Callback Pattern vs Promisify
**Problem**: Promisify wrapper sometimes loses error metadata.

**Cause**: Error mapping happens in callback, promisify may swallow details.

**Solution**:
```typescript
// ❌ AVOID - Can lose error details
const listAsync = promisify(this.client.list.bind(this.client));
const response = await listAsync(request, this.metadata);

// ✅ PREFERRED - Direct Promise wrapper
return new Promise((resolve, reject) => {
  this.client.list(request, this.metadata, (err, response) => {
    if (err) {
      reject(mapGrpcError(err));
      return;
    }
    resolve(response);
  });
});
```

## React Native Cross-Platform

### AsyncStorage Only (Not localStorage or SecureStore)
**Problem**: Code works on web but fails on mobile, or vice versa.

**Cause**: `localStorage` doesn't exist on mobile, `SecureStore` doesn't exist on web.

**Solution**:
```typescript
// ❌ WRONG - Web only
localStorage.setItem('key', 'value');

// ❌ WRONG - Mobile only
import * as SecureStore from 'expo-secure-store';

// ✅ CORRECT - Cross-platform
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('key', 'value');
```

### Storage Keys Must Be Scoped
**Problem**: Filter state bleeds between applications.

**Cause**: Generic keys like `device_filters` are shared globally.

**Solution**:
```typescript
// ❌ WRONG - Global key
const key = 'device_filters';

// ✅ CORRECT - Scoped to application
const key = `@device_filters_${applicationId}`;
```

**Pattern**: Use `@namespace_${id}` for all scoped storage.

## Profile Management

### Backwards Compatibility for Profile Structure
**Problem**: App crashes after updating profile format from flat to nested.

**Cause**: Old profiles in AsyncStorage use flat structure, new code expects nested `server` object.

**Solution**:
```typescript
// Always migrate on load
const migrateProfile = (profile: any): Profile => {
  if (profile.address && !profile.server) {
    // Old flat format - migrate
    return {
      ...profile,
      server: {
        address: profile.address,
        useTLS: profile.useTLS,
        apiToken: profile.apiToken,
      }
    };
  }
  return profile;
};
```

**Location**: Handle in storage load functions, not throughout the app.

### Auto-Discovery Before Testing
**Problem**: Test connection button confusing when tenant IDs not configured.

**Cause**: Users don't realize tenant ID is required before testing.

**Solution**: Show clear validation message:
```typescript
if (!tenantIds || tenantIds.length === 0) {
  Alert.alert(
    'Tenant IDs Required',
    'Please enter or discover tenant IDs before testing connection.'
  );
  return;
}
```

## Build System

### Generated Protobuf Files Must Be in Git
**Problem**: EAS builds fail with "cannot find module" errors.

**Cause**: EAS doesn't run `npm run proto:all` before building.

**Solution**:
- Commit `src/generated/` to version control
- Regenerate locally after proto updates
- Never edit generated files manually

**When to regenerate**:
```bash
# After ChirpStack version upgrade
npm run proto:all

# After MODURA proto changes
npm run proto:modura
```

## API Architecture

### MODURA Uses REST, ChirpStack Uses gRPC-Web
**Problem**: Mixing client patterns causes confusion.

**Cause**: Different backends use different protocols.

**Solution**:
```typescript
// ChirpStack - gRPC-Web with protobuf
import { ChirpStackApi } from '@/api/chirpstack';
const api = new ChirpStackApi(config);

// MODURA - REST with JSON
import { fetchModencodeAnalysis } from '@/services/modencode-troubleshooter-rest';
const result = await fetchModencodeAnalysis(config, payload);
```

**Don't**: Try to use gRPC clients for MODURA or REST for ChirpStack.

### Service Exports Should Include Interfaces
**Problem**: Consumers import from generated files instead of service wrappers.

**Cause**: Interfaces not exported from service modules.

**Solution**:
```typescript
// ✅ Export domain interfaces alongside implementation
export interface Application {
  id: string;
  name: string;
  // ... domain fields
}

export class ApplicationsApi {
  async list(): Promise<Application[]> { /* ... */ }
}
```

**Why**: Keeps generated protobuf types internal, exposes clean domain model.

## Theme System

### App Default is Dark Mode
**Problem**: Users expect light mode by default.

**Cause**: `app.json` sets `userInterfaceStyle: "dark"`.

**Context**: This is intentional - app defaults to dark, but users can override in preferences.

**Solution**: If changing default, update `app.json`:
```json
{
  "expo": {
    "userInterfaceStyle": "light"  // or "automatic"
  }
}
```

### Theme Hook Required for Colors
**Problem**: Hardcoded colors don't respect theme changes.

**Cause**: Not using theme context.

**Solution**:
```typescript
// ❌ WRONG - Hardcoded
<View style={{ backgroundColor: '#1a1a1a' }}>

// ✅ CORRECT - Theme-aware
const { colors } = useTheme();
<View style={{ backgroundColor: colors.background }}>
```

## Debugging

### Compare v1 and v2 When Stuck
**Problem**: Can't determine if issue is credentials or code.

**Cause**: No baseline to compare against.

**Solution**:
```bash
# Temporarily switch to v1 to test credentials
# Edit index.js, change import from './src-v2/App' to './src/App'
npm start
```

**When**: Authentication failures, API errors, configuration issues.

### Log Metadata Keys, Not Values
**Problem**: Tokens logged to console, leaked in crash reports.

**Cause**: Logging full metadata object.

**Solution**:
```typescript
// ❌ WRONG - Logs sensitive token
console.log('Metadata:', metadata);

// ✅ CORRECT - Logs structure only
console.log('Metadata keys:', Object.keys(metadata));
console.log('Token length:', token.length);
```

## Common Error Messages Decoded

| Error Message | Real Cause | Solution |
|--------------|------------|----------|
| `invalid length 32, found 0` | Missing tenant ID parameter | Pass valid UUID to API call |
| `authentication failed (code 16)` | Missing/wrong auth header | Use both authorization headers |
| `no authorization provided` | Only using grpc-metadata header | Add standard `authorization` header too |
| `cannot find module 'generated/...'` | Protobuf files not generated | Run `npm run proto:all` and commit |
| Base64 decode error in token | Token has whitespace | Strip with `.replace(/\s+/g, '')` |

## Version-Specific Notes

### ChirpStack v4 vs v3
- v4 uses gRPC exclusively (no REST API)
- v4 requires tenant ID for most operations
- v4 API keys have `typ:"key"` in JWT (not `typ:"JWT"`)
- Profile endpoint doesn't work with API keys (use applications.list for testing)

### React Native 0.81.5 + Expo SDK 54
- Must use legacy peer deps: `npm install --legacy-peer-deps`
- AsyncStorage is separate package (not in react-native core)
- No built-in navigation (using React Navigation v6)

---

**Last Updated**: December 22, 2025
**Maintainers**: Add new gotchas as discovered, with Problem/Cause/Solution structure.
