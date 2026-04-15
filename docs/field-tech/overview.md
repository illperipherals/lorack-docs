---
sidebar_position: 1
title: Field Tech Access
description: Creating and managing read-only invites for field technicians
---

# Field Technician Access

Field Technician Access lets admins create limited, read-only invites for field techs who need to view and occasionally onboard devices — without giving them full admin control.

## How It Works

An admin creates an invite from the **Profiles** screen. The invite is a QR code (or shareable string) that a field tech scans to set up a pre-configured, read-only profile on their device. The invite contains:

- Server address and connection settings
- A scoped, non-admin API token
- A friendly label for the field tech
- Optional: which applications the field tech can see
- Optional: how many devices the field tech is allowed to add ("onboarding credits")
- Optional: SenseCAP provisioning defaults such as frequency plan, sub-band, and platform

## Creating an Invite (Admin)

1. Go to the **Profiles** screen
2. Tap the **Field Tech Access** button on the profile you want to share
3. Give the invite a label (e.g., the field tech's name)
4. Select a tenant
5. **Restrict applications** (optional) — check the specific applications the field tech should see. Leave all unchecked to allow access to every application in the tenant.
6. **Set onboarding credits** (optional) — enter the number of devices the field tech is allowed to add. Leave at 0 if they should have view-only access with no device creation.
7. Expand **Provisioning Defaults** (optional) to pre-configure SenseCAP frequency plan, sub-band, and platform for the technician.
8. Tap **Create Invite**

The invite is cryptographically signed using your API token, so any tampering during transit will be detectable.

> **Tip:** You can tap a previously created invite to view it again and verify its signature integrity.

## Importing an Invite (Field Tech)

1. Go to the **Profiles** screen
2. Tap the **QR code scanner** icon
3. Scan the admin's QR code — or paste the invite string manually
4. The app shows a summary of what the invite grants (server, tenant, any restrictions)
5. Accept to create the profile

The profile appears in the Profiles list with a **read-only badge**. If the invite included app restrictions or credits, those are shown as badges on the profile card.

If provisioning defaults were included, the SenseCAP BLE provisioning screen uses them as the starting values for new onboarding sessions.

## What Field Techs Can Do

| Capability | Without Credits | With Credits |
|-----------|----------------|-------------|
| View applications | Yes (filtered if restricted) | Yes (filtered if restricted) |
| View devices and health data | Yes | Yes |
| View gateways | Yes | Yes |
| Run site visits | Yes | Yes |
| Add new devices | No | Yes (up to credit limit) |
| Edit or delete devices | No | No |
| Manage applications | No | No |

## Onboarding Credits

When a field tech has onboarding credits, a **credit badge** appears on the Devices screen's add button showing the remaining count. Each time the field tech successfully creates a device, one credit is deducted. When credits reach zero, the add button disappears.

Credits are tracked locally on the field tech's device. An admin can adjust credits after import by tapping **Edit Access** on the profile card in the Profiles screen.

## SenseCAP BLE Onboarding

Field-tech access is designed to support in-field SenseCAP onboarding on Android.

With a signed invite plus onboarding credits, a technician can:

- scan a SenseCAP QR code to pre-fill DevEUI, JoinEUI/AppEUI, AppKey, and model details when present
- open the BLE provisioning screen and connect to the nearby S210x sensor
- use the pre-configured frequency plan, sub-band, and platform from the invite
- create the device in ChirpStack once provisioning succeeds
- consume one onboarding credit only after successful device creation

This keeps the in-field workflow fast while still constraining what the technician can see and how many devices they can add.

## Editing Access After Import

Admins (or the field tech themselves) can adjust restrictions post-import:

1. Go to the **Profiles** screen
2. Find the read-only profile and tap **Edit Access**
3. Update allowed applications or credit count
4. Save

This is useful when an admin wants to grant additional credits remotely (e.g., by telling the field tech to change the number) or when project scope changes.

## Data Flow

```
Admin creates invite (FieldTechAccessScreen)
  → selects allowed apps + credit count
  → ChirpStack API key created (scoped, non-admin)
  → payload encoded as base64url, HMAC-signed with admin's API token
  → QR code / invite string shared to field tech

Field Tech imports invite (ServersScreen)
  → decodes payload, extracts signature
  → creates profile with hasDeviceWritePermissions: false
  → stores allowedApplicationIds, onboardingCredits, inviteSignature

Runtime enforcement:
  → ApplicationsScreen filters by allowedApplicationIds
  → SenseCAP provisioning and add-device flows check credits > 0 before creating, decrement after successful create
  → DevicesScreen shows Add Device FAB only when credits remain
```
