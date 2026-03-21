---
draft: true
sidebar_position: 2
title: Troubleshooting
description: Common issues and solutions for LoRACK!
---

# Troubleshooting Guide

Common issues and solutions for LoRACK! with optional MoD AI integration.

---

## Table of Contents

- [Connection Issues](#connection-issues)
- [Authentication Errors](#authentication-errors)
- [MoD AI Issues](#mod-ai-issues)
- [UI and Display Problems](#ui-and-display-problems)
- [Performance Issues](#performance-issues)
- [Debugging Tools](#debugging-tools)
- [Common Error Codes](#common-error-codes)
- [Quick Fixes Checklist](#quick-fixes-checklist)

---

## Connection Issues

### "Service unavailable" or "Connection refused"

**Symptoms:**
- App shows "Service unavailable" error
- Cannot load applications, devices, or gateways
- Network requests fail immediately

**Possible Causes:**
1. Incorrect server address or port
2. ChirpStack server not running
3. Firewall blocking connection
4. Network connectivity issues

**Solutions:**

1. Verify your server address is in `host:port` format (e.g., `chirpstack.example.com:8080`)
2. Confirm ChirpStack is running and the gRPC port is accessible
3. Test connectivity from your device's network:
   ```bash
   curl -v http://your-server:8080/
   # or for HTTPS:
   curl -v https://your-server:443/
   ```
4. In the app: Settings > Edit Profile > verify server address and TLS setting

> **TLS/Port Rule**: Use `useTLS: false` for HTTP on port 8080. Use `useTLS: true` for HTTPS on port 443. Always include the port explicitly.

---

### "Request timeout" or slow responses

**Symptoms:**
- Requests take longer than 30 seconds
- App hangs on loading screens
- Eventually shows timeout error

**Possible Causes:**
1. High network latency between app and server
2. ChirpStack server under heavy load
3. Large response payloads (many devices or gateways)

**Solutions:**
- Check network latency: `ping your-server.com`
- Ensure your device has a stable connection (Wi-Fi or cellular)
- If fetching many devices, the app paginates automatically — wait for the initial load
- Try from a network with lower latency

---

### Connection works locally but not remotely

**Symptoms:**
- Works on same network as ChirpStack
- Fails when accessing from internet or different network

**Possible Causes:**
1. Firewall blocking external access to the gRPC port
2. ChirpStack bound to localhost only
3. DNS resolution issues
4. TLS required for external access but not configured

**Solutions:**

1. **Firewall**: Ensure the gRPC port (8080 or 443) is open for inbound connections:
   ```bash
   sudo ufw allow 8080/tcp   # adjust for your system
   ```
2. **Binding**: Verify ChirpStack is bound to `0.0.0.0`, not `127.0.0.1`
3. **DNS**: Verify DNS resolves correctly: `nslookup your-server.com`
4. **TLS**: For external access, use HTTPS with a valid certificate (e.g., Let's Encrypt)
5. Test with the server's IP address directly to rule out DNS issues

---

## Authentication Errors

### "Authentication failed" (gRPC code 16 — UNAUTHENTICATED)

**Symptoms:**
- Error code 16
- "Check API token in Settings" message
- Cannot load any data despite correct server address

**Possible Causes:**
1. Incorrect API token
2. Token expired
3. Token has insufficient permissions
4. Token contains extra whitespace from copy/paste

**Solutions:**

1. **Regenerate the token** in ChirpStack web UI:
   - Log in to ChirpStack > API Keys > Generate new key
   - Copy the ENTIRE token (no extra spaces or newlines)

2. **Update in app**:
   - Settings > Edit Profile > delete the old token
   - Paste the new token
   - Use the Show button to verify it looks correct
   - Save and test connection

3. **Verify the token works** directly:
   ```bash
   grpcurl -plaintext \
     -H "authorization: Bearer YOUR_TOKEN" \
     your-server:8080 \
     api.TenantService/List
   ```

> **Tip**: API tokens can pick up trailing whitespace when copied. The app strips whitespace automatically, but verify the token is clean if issues persist.

---

### "Not authorized" or permission denied errors

**Symptoms:**
- Can see some data but not others
- Specific operations fail (e.g., can list but cannot edit)

**Possible Causes:**
1. API token has limited permissions (tenant-scoped, read-only)
2. Wrong tenant ID configured
3. User account restrictions in ChirpStack

**Solutions:**

1. **Check token permissions** — ensure the token has admin or adequate tenant access in ChirpStack
2. **Verify tenant access** — Settings > Edit Profile > verify tenant IDs are correct
3. **Read-only mode** — if your token is read-only, the app will show a read-only indicator. Contact your administrator for write access.

---

## MoD AI Issues

### MoD AI features not showing in app

**Symptoms:**
- No AI Troubleshooter button on Home screen
- No AI features in Device Details
- No MoD sections in Settings

**Cause:**
MoD AI is not configured in the active profile.

**Solution:**

1. Settings > Edit Profile
2. Scroll to **MoD AI (Optional)** section
3. Enter both:
   - MoD Endpoint (e.g., `mod.example.com:443`)
   - MoD API Token
4. Save the profile
5. Return to Home screen — the AI Troubleshooter button should appear

> Both the endpoint AND the token are required. If either is missing, MoD features remain hidden.

---

### AI Troubleshooter: "Connection failed" or timeouts

**Symptoms:**
- Can type messages but get no AI response
- "AI is thinking..." indicator stays indefinitely
- Error: "Request timeout" or "Service unavailable"

**Possible Causes:**
1. MoD AI backend not running
2. Incorrect MoD endpoint
3. MoD API token is wrong or expired
4. MoD backend overloaded

**Solutions:**

1. Verify the MoD backend is running and accessible
2. In the app: Settings > Edit Profile > verify the MoD endpoint and token
3. Try a simple query first (e.g., "Hello") to test connectivity
4. Check MoD backend logs for errors

---

### Device health scores not loading

**Symptoms:**
- Device Details screen loads fine but no health scores appear
- Health tab shows loading indefinitely

**Possible Causes:**
1. MoD backend hasn't analyzed this device yet
2. Device has insufficient data (no recent frames or events)
3. MoD service error

**Solutions:**
- Open the AI Troubleshooter and ask about the device — this can trigger initial analysis
- Ensure the device has recent uplink frames (check the Frames tab)
- Verify the device exists in ChirpStack with the correct DevEUI
- Check MoD backend logs for errors

---

## UI and Display Problems

### Profile card shows wrong information

**Symptoms:**
- Profile displays old server address
- MoD AI badge shows when it shouldn't (or vice versa)

**Solution:**

1. Pull down to refresh on the Settings screen
2. If still incorrect, restart the app
3. Last resort: Settings > Delete Profile > recreate it

---

### App crashes on startup

**Symptoms:**
- App opens then immediately closes
- Stuck on splash screen

**Possible Causes:**
1. Corrupted local storage
2. Invalid profile data from an older version
3. App version incompatibility

**Solutions:**

**Clear app data:**
- **iOS**: Delete and reinstall the app
- **Android**: Settings > Apps > LoRACK > Clear Data
- **Web**: Clear browser localStorage for the app's domain

**Check logs:**
```bash
# Expo/React Native logs
npx react-native log-ios
npx react-native log-android
```

---

### Chat messages not persisting

**Symptoms:**
- AI chat history disappears after closing app
- Sessions don't restore on return

**Possible Causes:**
1. Storage permissions issue on device
2. Storage quota exceeded
3. Session ID mismatch

**Solutions:**
- Check storage permissions on mobile
- Clear old sessions: start a new AI session from the device
- On web, check browser storage quota

---

## Performance Issues

### Slow app startup

**Possible Causes:**
1. Large amount of cached data in local storage
2. Many profiles configured
3. Network latency during connection check

**Solutions:**
- Clear old chat sessions and cached frame data
- Archive unused profiles
- Ensure a fast network connection

---

### High memory usage

**Possible Causes:**
1. Many frames/events cached for multiple devices
2. Large chat histories
3. Many photos stored in contacts

**Solutions:**
- Clear frame and event caches from the More tab in Device Detail
- Start new AI chat sessions to clear old history
- Restart the app periodically during heavy use

---

## Debugging Tools

### Enable Debug Logging

**React Native Debugger:**
```bash
# iOS
npm run ios
# Then: Cmd+D > Debug

# Android
npm run android
# Then: Cmd+M > Debug
```

**Console logs:**
- All gRPC calls are logged with timing information
- Look for `[ChirpstackGrpc]` prefixed log entries
- Check for error codes and messages

---

### Streaming Debug

The app includes a built-in streaming debug tool at **Settings > Developer Tools > Streaming Debug**. Enter a DevEUI and use the four test modes to diagnose streaming issues:

| Mode | What It Tests | Details |
|------|--------------|---------|
| **Fetch** | Raw `expo/fetch` binary streaming | Reads the response body as a binary stream and logs bytes in hex. This is the iOS-preferred transport path. |
| **XHR** | `XMLHttpRequest` with grpc-web-text | Sends and receives base64-encoded chunks. This is the Android-preferred transport path. |
| **Frames** | End-to-end `streamDeviceFrames()` | Calls the full gRPC streaming pipeline, auto-selects the platform transport, and displays decoded frame messages with timestamps. |
| **Events** | End-to-end `streamDeviceEvents()` | Same as Frames but for device events (joins, errors, status changes). |

Each mode shows a real-time monospace log with timestamps. Use **Stop** to halt an active test and **Clear Log** to reset.

**When to use which mode:**
- Start with **Frames** or **Events** — if they work, streaming is healthy
- If they fail, use **Fetch** (iOS) or **XHR** (Android) to isolate whether the issue is in the transport layer or the gRPC client

---

### Test gRPC Services Directly

**Install grpcurl:**
```bash
# macOS
brew install grpcurl

# Linux
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest
```

**Test ChirpStack connection:**
```bash
grpcurl -plaintext \
  -H "authorization: Bearer YOUR_TOKEN" \
  your-server:8080 \
  api.TenantService/List
```

---

### Check Local Storage Contents

**React Native (debugger console):**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// List all storage keys
AsyncStorage.getAllKeys().then(console.log);

// Get a specific item
AsyncStorage.getItem('chirpstack_profiles').then(console.log);
```

---

## Common Error Codes

| Code | Name | Meaning | Solution |
|------|------|---------|----------|
| 0 | OK | Success | No action needed |
| 1 | CANCELLED | Request cancelled | Retry the operation |
| 2 | UNKNOWN | Unknown error | Check logs for details |
| 3 | INVALID_ARGUMENT | Bad request data | Check input format (e.g., tenant ID) |
| 4 | DEADLINE_EXCEEDED | Timeout | Check network or increase timeout |
| 5 | NOT_FOUND | Resource not found | Verify IDs are correct |
| 7 | PERMISSION_DENIED | Insufficient permission | Check token permissions |
| 12 | UNIMPLEMENTED | Feature not available | Backend doesn't support this operation |
| 14 | UNAVAILABLE | Service down | Check server is running and reachable |
| 16 | UNAUTHENTICATED | Bad or missing token | Verify API token in profile |

---

## Quick Fixes Checklist

When something doesn't work, try these steps in order:

- [ ] Restart the app
- [ ] Check internet connection
- [ ] Verify the ChirpStack server is running and accessible
- [ ] Test server connection: `curl http://your-server:8080`
- [ ] Check API tokens are correct and not expired
- [ ] Verify profile configuration in Settings (address, port, TLS, tenant ID)
- [ ] Clear app cache/data and reconfigure
- [ ] Update to the latest app version
- [ ] Check this troubleshooting guide
- [ ] Contact support at support@nightjarsolutions.io

---

## Getting Help

If issues persist:

1. **Check documentation:**
   - [Home](/) — Features and user guide
   - [Quick Start](/getting-started/quickstart) — Setup and connection guide
   - [Build Mobile](/building/build-mobile) — Build instructions

2. **Gather information before reporting:**
   - App version (shown in About dialog on Home screen)
   - Platform (iOS / Android / Web)
   - Server address (redact sensitive parts)
   - Exact error messages
   - Steps to reproduce

3. **Contact support:**
   - Email: support@nightjarsolutions.io
   - Website: [nightjarsolutions.io](https://nightjarsolutions.io)
   - Or use the in-app Help screen to submit a support request

---

**Most Common Issues (90% of problems):**
1. Wrong server address or port — format must be `host:port`
2. TLS mismatch — TLS off for `:8080`, on for `:443`
3. Bad API token — regenerate in ChirpStack and re-paste
4. MoD not configured — both endpoint AND token are required
5. Firewall blocking — ensure the gRPC port is open
