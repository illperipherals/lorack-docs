---
sidebar_position: 2
title: Invite Format & Security
description: Technical details of the invite payload format and security model
---

# Invite Format & Security

## Invite Payload Versions

```
v1: base64url(JSON)                         — original, no restrictions
v2: base64url(JSON)                         — adds allowedAppIds + onboardingCredits
v2 signed: base64url(JSON).hmac_sha256_hex  — tamper-evident via admin token
```

All versions are backward compatible. `decodeInvite()` accepts all three.

## Security Model

**The real security boundary is ChirpStack's API key permissions.** The field tech's token is a non-admin tenant-scoped key — ChirpStack itself enforces what API calls succeed or fail.

The client-side restrictions (`allowedApplicationIds`, `onboardingCredits`) are **management convenience, not security boundaries**. They scope the field tech's workflow within the app and prevent accidental misuse. They are stored in plain AsyncStorage and enforced only in the UI.

### Why this is acceptable

- Field techs are trusted employees/contractors with physical access to LoRaWAN infrastructure
- A malicious actor with root device access could bypass any client-side check — but could also extract the API token and call ChirpStack directly
- The appropriate defense against untrusted users is revoking their API key, not client hardening

### HMAC Signing

Invites are signed with the admin's API token using HMAC-SHA256 (`src/utils/field-tech-invite.ts`). This prevents modification by intermediaries who don't possess the admin token.

The signature is stored on the profile for admin-side audit verification. It does **not** prevent the invite recipient from stripping the signature before import (unsigned invites are accepted for backward compatibility).

### Revoking Access

To fully revoke a field tech's access, **delete or regenerate the API key** in ChirpStack. Client-side restrictions alone are not sufficient for untrusted users.

## Key Implementation Files

| File | Role |
|------|------|
| `src/utils/field-tech-invite.ts` | Encode/decode/sign/verify invite payloads |
| `src/services/field-tech-invite-storage.ts` | Persist invite metadata for QR recall |
| `src/services/profile-storage.ts` | Profile interface (allowedApplicationIds, onboardingCredits, inviteSignature) |
| `src/screens/FieldTechAccessScreen.tsx` | Admin: create invites with app restrictions + credits |
| `src/screens/ServersScreen.tsx` | Import invites; "Edit Access" modal for post-import adjustments |
| `src/screens/ApplicationsScreen.tsx` | Filters apps by allowedApplicationIds |
| `src/screens/AddDeviceScreen.tsx` | Checks/decrements credits on device creation |
| `src/screens/DevicesScreen.tsx` | Shows FAB + credit badge for field techs with credits |
| `src/components/ReadOnlyBadge.tsx` | Displays read-only status + remaining credits |
