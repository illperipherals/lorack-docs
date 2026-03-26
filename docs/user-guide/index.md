---
sidebar_position: 1
title: User Guide
description: Complete guide to using LoRACK! for LoRaWAN management
---

# LoRACK! User Guide

![alt text](/img/image.png)

Welcome to LoRACK! LoRaWAN Manager! LoRACK! is a mobile app for managing your LoRaWAN network from anywhere. This guide walks you through everything you need to know to get started and make the most of the app.

---

## What Is LoRACK!?

LoRACK! connects directly to your [ChirpStack](https://www.chirpstack.io/) server to let you manage devices, gateways, and applications from your phone or tablet.

**Key things to know before you start:**

- LoRACK! connects to ChirpStack via gRPC-Web — no proxy server is needed
- The app works on iOS and Android
- The app caches data locally for quick access; most actions require connectivity for live updates
- You need a running ChirpStack v4 server and an API token to get started

---

## Part 1: Setting Up Your First Connection

### What You Need

Before opening the app, have the following ready:

1. **Server address** — the hostname and port of your ChirpStack server (e.g., `chirpstack.example.com:8080`)
2. **API token** — generated in the ChirpStack web UI under **API Keys**
3. **TLS setting** — whether your server uses HTTP or HTTPS

> **Quick rule:** If the port is `8080`, TLS is off. If the port is `443`, TLS is on. Always include the port number.

### Step 1: Create a Server Profile

A "profile" in LoRACK! represents one ChirpStack server. You can create multiple profiles and switch between them.

1. Open the app — you'll see the Home screen

      ![alt text](/img/image-4.png)

2. Tap the **profile dropdown** at the top of the screen or just click the **Go to Profiles** button.

      ![alt text](/img/image-5.png)

3. Choose **Create New Profile**

      ![alt text](/img/image-6.png)

4. Fill in:

- **Profile Name** — a friendly label like "Production Server" or "Lab ChirpStack"
- **Server Address** — e.g., `chirpstack.example.com:8080`
- **Use TLS** — toggle on for HTTPS, off for HTTP
- **API Token** — paste your full token

5. Enter a Tenant ID (you may be able to tap **Discover Tenants** to automatically find your available tenants if you have this access)

6. Save the profile

### Step 2: Verify Your Connection

Navigate to **Applications** or **Gateways** from the Home screen. If your data appears, everything is working.

![alt text](/img/image-7.png)

Look at the **connection indicator** next to your profile name:

- **Green** = connected with full access
- **Yellow** = connected with read-only access
- **Red** = disconnected or authentication error

---

## Part 2: Navigating the Home Screen

The Home screen is your central hub. It shows quick-action buttons for all major features:

| Button | What It Does |
|--------|-------------|
| **Applications** | Browse your LoRaWAN applications and their devices |
| **Gateways** | View gateway status, location, and details |
| **Site Visit** | Run a structured field inspection workflow |
| **Address Book** | Manage contacts across your network |
| **Alerts** | Monitor network health with configurable rules |

Below the main buttons, a **Scan QR Code** tile lets you quickly look up a device by scanning its QR code.

If you have an active site visit in progress, a chip appears showing the application name and completion percentage. Tap it to resume.

---

## Part 3: Managing Applications and Devices

### Applications

Tap **Applications** to see all LoRaWAN applications for your active tenant. Each application card shows its name, device count, and any attached contacts or photos.

From here you can:

- Tap an application to see its devices
- Create a new application with the **+** button
- Edit or delete applications (if you have write access)

### The Devices List

When you open an application, you'll see its device list. This is one of the most powerful screens in LoRACK!

**Searching and filtering:**

- Use the **search bar** to find devices by name or DevEUI
- Tap **Filter** to narrow by connection status, device profile, or battery availability
- Tap **Sort** to order by name, last-seen time, or health score
- The header shows filtered count vs. total (e.g., "15 / 200 devices")

**Switching views:**

- **List view** — device cards with health scores, battery indicators, and last-seen times
- **Map view** — see devices and gateways plotted geographically (requires location data)

**Bulk actions (compare & move):**

- Tap **Compare mode** in the header to select multiple devices
- Use **Compare** to open side-by-side health stats
- Use **Move** to transfer selected devices to another server profile (choose destination tenant, application, and device profile)

**Fleet health summary:**
Above the device list, an aggregate health bar shows average battery, connectivity, signal, and data quality scores across all devices in the application.

### Device Detail

Tap any device to open its detail screen. Tabs are ordered: Health → Info → Sensors → Data → Commands.

**Info tab** — Device identity (DevEUI, JoinEUI), name, description, device profile, activation type (OTAA/ABP), and last-seen timestamp. Tap the pencil icon to edit properties.
You can also enable or disable the device from the overview controls.

Additional actions in the Info tab:

- **Move** — transfer the device to another server profile
- **Codec Helper** — open the codec helper for the device profile's codec script
- **Not activated banner** — if an OTAA device has no active session, the banner provides quick OTAA steps and a refresh action
- **Survey Device** — tags a device that naturally reports infrequently; a badge appears in the header and list for context

**Health tab** — An overall health score (0–100) broken down into four components:

- **Battery** — voltage, charge level, drain trends
- **Connectivity** — how recently the device reported, message rate, gateway coverage
- **Signal** — RSSI, SNR, and link margin
- **Data Quality** — message gaps, duplicates, and error rates

Each component shows a trend arrow (improving, stable, or declining). Tap any metric to drill into time-series charts with selectable time ranges (24 hours, 7 days, 30 days, 90 days).

**Sensors tab** — Displays decoded telemetry values extracted from recent uplink payloads (e.g., temperature, humidity, battery voltage). Requires the device profile to have a payload codec configured in ChirpStack. Values update automatically as new frames arrive.

**Data tab** — View raw uplink frames and device events (joins, activations, errors). Useful for debugging. Tap a field title in drilldowns to copy its value.

**Commands tab** — Send downlink commands to the device. Choose an FPort, payload format (HEX, Template, or JSON), and whether to require confirmed delivery. You can also pick from saved commands in your Command Library.

---

## Part 4: Monitoring with Alerts

The Alerts system lets you set up rules to automatically watch for problems across your network.

### Viewing Alerts

Open **Alerts** from the Home screen. The dashboard shows:

- A **summary bar** with counts for Critical, Warning, and Info severity
- Tap a severity in the summary bar to filter the alert list
- **Tabs** to filter: All, Active, Acknowledged, Resolved
- Each alert shows its severity, title, affected device/gateway, and timestamp

You can **acknowledge** alerts (to mark them as seen) or **resolve** them directly from the list.

### Creating Alert Rules

Tap the rules icon to manage your alert rules. You can create rules for conditions like:

- Device offline for more than X minutes
- Battery below X%
- Signal degradation past a threshold
- Gateway offline
- No uplinks received within a time window
- Join failures exceeding a count
- Frame counter resets

Each rule has a **severity level** (Info, Warning, Critical) and can be enabled or disabled individually.

> **Tip:** Start with Warning severity while testing new rules, then promote to Critical once you've confirmed they work as expected.

---

## Part 5: QR Code Scanning

Tap **Scan QR Code** on the Home screen and point your camera at a QR code on device packaging. LoRACK! will parse the DevEUI and JoinEUI from the code.

- If the device already exists on any of your configured servers, the app navigates to its detail screen
- If the device is not found, the app offers to create it with the scanned information pre-filled
- If the QR code contains an AppKey, it will be captured and pre-filled during device key setup
- Supports LoRa Alliance TR005 device identification QR codes (e.g., `LW:D0:...`)

This is the fastest way to look up or onboard devices in the field.

**OTAA join reminder (GLAMOS Walker):**

If the device shows **Not activated**, make sure the Walker is set to **OTAA** and then send a message to trigger a join:

1. `PARAMETERS → ACTIVATION → OTAA`
2. `SEND → ONCE` to trigger join

---

## Part 6: AI Troubleshooter

> Requires MoD AI configuration in your profile settings.

The AI Troubleshooter provides a chat interface where you can ask questions about your network in plain English. It works like a conversation — ask about device health, connectivity problems, battery issues, or signal quality.

**Quick-action buttons** at the top give you one-tap access to common checks:

- Health overview
- Battery analysis
- Signal quality report
- Connectivity assessment

The troubleshooter can detect offline devices, poor signal conditions, and battery drain patterns, then provide actionable recommendations with links back to specific device metrics.

Chat history is saved locally (up to 50 messages per session).

---

## Part 7: Photos and Contacts

You can attach photos and contacts to devices, applications, and gateways. This is useful for tracking who is responsible for what equipment, or for documenting installation details with photos.

**Photos & Contacts screen:** Tap the photo placeholder or existing photo on any device, application, or gateway card to open the Photos & Contacts screen.

**Add a photo or contact:** Use the primary action on the Photos & Contacts screen to add a new photo or contact (name, email, phone number, role).

**Managing photos:** Upload multiple photos per resource, set a primary photo (which appears in list views), and use pinch-to-zoom for inspection.

**Address Book:** The centralized Address Book (accessible from the Home screen) lets you manage contacts across your entire profile and reuse them via the Contact Selector.

**Backup:** Export and import contacts from Settings, with the option to include or exclude photos to manage file size.
Backups live in **Settings → Backups**.

---

## Part 8: Codec Helper

The Codec Helper lets you test and debug payload decoder scripts — the JavaScript functions that turn raw LoRaWAN bytes into readable sensor values like temperature, humidity, or battery voltage.

### Opening the Codec Helper

1. Navigate to a **Device Detail** screen
2. Open the **Info** tab
3. Tap **Codec Helper** (only appears if the device's profile has a codec script configured in ChirpStack)

### What You Can Do

**Test with recent payloads:** The helper loads the last 20 uplink payloads from the device's frame and event caches. Tap any payload to run it through the codec and see the decoded output instantly.

**Enter a custom payload:** Type a hex string and fPort manually to test specific byte sequences — useful when reproducing issues or testing edge cases.

**Edit the codec script live:** The built-in editor shows the device profile's codec script. Make changes and see how they affect the decoded output in real time. Edits are temporary — they don't modify the device profile on ChirpStack.

**Compare original vs. modified:** When you edit the script, the helper shows a side-by-side comparison highlighting fields that changed, were added, or were removed between the original and modified decoders.

**Copy results:** Tap any decoded result to copy it to the clipboard for sharing or further analysis.

### Supported Codec Patterns

The helper recognizes the codec function signatures used by ChirpStack:

- `decodeUplink({ bytes, fPort })` — ChirpStack v4 standard
- `Decode(port, bytes)` — ChirpStack v3 / TTN legacy
- `decode(port, bytes)` — alternative naming

If your codec defines one of these functions, the helper calls it automatically. Scripts that `return` a result directly at the top level also work.

### Tips

- **Reset** your edits at any time with the reset button — the original script from ChirpStack is always preserved
- If a codec throws an error, the helper displays the error message inline so you can fix the script
- Use the Codec Helper alongside the **Data** tab to cross-reference raw frame bytes with decoded values
- Codec scripts run locally on your device — no network call is needed to decode

---

## Part 9: Command Library

The Command Library stores reusable downlink command templates so you don't have to rebuild them every time.

**Organizing commands:** Commands are grouped by category — Configuration, Control, Query, Maintenance, Diagnostics, Time, and Custom. Use the search bar to find commands quickly.

**Creating a command:** Give it a name, set the FPort, choose a payload format (HEX for raw bytes, Template for parameterized payloads, JSON for codec-enabled devices), and optionally mark it as confirmed.

**Using commands:** When sending a downlink from a device's Commands tab, tap the library icon to pick a saved command. The payload and settings are copied into the form.

**Sharing:** Export your entire library as JSON to share with teammates, or import a colleague's library.

---

## Part 10: Site Visits

Site Visits provide a structured workflow for field technicians inspecting devices on-site.

### Running a Site Visit

1. Tap **Site Visit** on the Home screen
2. Select the application you're visiting
3. You'll see a list of all devices in that application with checkboxes
4. For each device, work through the standard checklist:
   - Visual Inspection
   - Health Check
   - Signal Test
   - Photos & Notes
   - Mark Complete
5. Add notes and findings for each device as needed
6. Track your progress via the percentage indicator in the header

### Findings

As you inspect devices, you can log findings with a title, severity (Info, Warning, Critical), and description. Findings persist until you explicitly mark them as resolved.

### Reports

When you're done, generate a shareable text report. The report screen offers three ways to share:

- **Send Email** — opens your email client with the report pre-filled in the body. If the application has contacts with email addresses, those are suggested as recipients.
- **Share** — opens the system share sheet so you can send via any installed app
- **Copy to Clipboard** — copies the full report text for pasting elsewhere

> **Tip:** Your visit progress saves automatically and persists across app restarts. You can leave and come back without losing progress.

---

## Part 11: Comparing Devices

When troubleshooting, it helps to compare similar devices side by side.

1. On the Devices screen, tap **Compare mode** in the header
2. Select 2–4 devices using the checkboxes
3. Tap **Compare**

The comparison view shows health scores, battery levels, connectivity, signal, and data quality metrics in color-coded bars so you can quickly spot which device is underperforming and why.

---

## Part 12: Settings and Preferences

Access Settings from the gear icon on the Home screen.

### Theme

Choose from four options:

- **Light** — bright interface
- **Dark** — reduced eye strain in low light (the default)
- **Night** — red-shifted colors for use in dark environments without affecting night vision
- **System** — follows your device's system setting

### Behavior Settings

| Setting | What It Does |
|---------|-------------|
| **Fetch Device Keys** | Automatically loads encryption keys on device detail (slightly slower) |
| **Start Fresh on Launch** | Always opens to a specific screen instead of your last-visited screen |
| **Start Screen** | Which screen to open on launch: Home, Devices, or QR Scanner |

### Commands

- **Command Library** — manage your saved downlink command templates (see [Part 9](#part-9-command-library))

### Backups

- **Contacts Backup** — export, import, and manage contact backups. Choose whether to include photos (larger file size) or just contact data. Backups are stored locally and can be shared.

### Developer Tools

- **Streaming Debug** — test gRPC-Web streaming with four modes: Raw Fetch, XHR Text, Frames, and Events (see [Troubleshooting](/getting-started/troubleshooting#streaming-debug))

### Profile Management (Profiles screen)

Manage server profiles from the Home screen using the profile dropdown or **Go to Profiles**.

- **Add/edit/delete profiles** to manage your ChirpStack server connections
- **Import/Export profiles** to onboard teammates quickly — export a profile and share it
- **Field Technician Access** — create read-only invites for field techs with optional app restrictions and onboarding credits (see [Part 13](#part-13-field-technician-access))

---

## Part 13: Field Technician Access

Field Technician Access lets admins create limited, read-only invites for field techs who need to view and occasionally onboard devices — without giving them full admin control.

For detailed invite format and security information, see [Field Tech Access](/field-tech/overview).

### How It Works

An admin creates an invite from the **Profiles** screen. The invite is a QR code (or shareable string) that a field tech scans to set up a pre-configured, read-only profile on their device. The invite contains:

- Server address and connection settings
- A scoped, non-admin API token
- A friendly label for the field tech
- Optional: which applications the field tech can see
- Optional: how many devices the field tech is allowed to add ("onboarding credits")

### Creating an Invite (Admin)

1. Go to the **Profiles** screen
2. Tap the **Field Tech Access** button on the profile you want to share
3. Give the invite a label (e.g., the field tech's name)
4. Select a tenant
5. **Restrict applications** (optional) — check the specific applications the field tech should see. Leave all unchecked to allow access to every application in the tenant.
6. **Set onboarding credits** (optional) — enter the number of devices the field tech is allowed to add. Leave at 0 if they should have view-only access with no device creation.
7. Tap **Create Invite**

The invite is cryptographically signed using your API token, so any tampering during transit will be detectable.

> **Tip:** You can tap a previously created invite to view it again and verify its signature integrity.

### Importing an Invite (Field Tech)

1. Go to the **Profiles** screen
2. Tap the **QR code scanner** icon
3. Scan the admin's QR code — or paste the invite string manually
4. The app shows a summary of what the invite grants (server, tenant, any restrictions)
5. Accept to create the profile

The profile appears in the Profiles list with a **read-only badge**. If the invite included app restrictions or credits, those are shown as badges on the profile card.

### What Field Techs Can Do

| Capability | Without Credits | With Credits |
|-----------|----------------|-------------|
| View applications | Yes (filtered if restricted) | Yes (filtered if restricted) |
| View devices and health data | Yes | Yes |
| View gateways | Yes | Yes |
| Run site visits | Yes | Yes |
| Add new devices | No | Yes (up to credit limit) |
| Edit or delete devices | No | No |
| Manage applications | No | No |

### Onboarding Credits

When a field tech has onboarding credits, a **credit badge** appears on the Devices screen's add button showing the remaining count. Each time the field tech successfully creates a device, one credit is deducted. When credits reach zero, the add button disappears.

Credits are tracked locally on the field tech's device. An admin can adjust credits after import by tapping **Edit Access** on the profile card in the Profiles screen.

### Editing Access After Import

Admins (or the field tech themselves) can adjust restrictions post-import:

1. Go to the **Profiles** screen
2. Find the read-only profile and tap **Edit Access**
3. Update allowed applications or credit count
4. Save

This is useful when an admin wants to grant additional credits remotely (e.g., by telling the field tech to change the number) or when project scope changes.

### Security Notes

- The **real security boundary** is the ChirpStack API key. The field tech's token is a non-admin, tenant-scoped key — ChirpStack itself enforces what API calls succeed or fail.
- **App restrictions and credits** are convenience controls in the LoRACK! app. They scope the field tech's workflow and prevent accidental misuse, but they are not a substitute for proper API key management.
- **Invite signing** (HMAC-SHA256) protects the invite payload during transit. If an invite is modified between the admin and the field tech, the signature will not match. Unsigned invites are still accepted for backward compatibility.
- To fully revoke a field tech's access, **delete or regenerate the API key** in ChirpStack.

---

## Part 14: Tips for Getting the Most Out of LoRACK!

**Use multiple profiles** — If you manage staging and production ChirpStack servers, create a profile for each and switch between them from the Home screen.

**Set up alerts early** — Configure alert rules for device-offline and low-battery conditions so you catch problems before they escalate.

**Leverage QR scanning** — When deploying new devices, scan their QR codes to speed up onboarding with pre-filled DevEUI and JoinEUI.

**Build a command library** — If you frequently send the same downlink commands, save them once in the Command Library and reuse them across devices.

**Map view** — Devices appear on the map when location data is present (e.g., GPS fields in uplinks or stored coordinates).

**Back up contacts regularly** — Use Settings > Export Contacts to create periodic backups, especially before updating the app.

**Use site visits for audits** — Even if you're not a field technician, the Site Visit workflow is useful for systematic device audits and generating documentation.

---

## Quick Reference: Common Tasks

| I want to... | Go to... |
|-------------|----------|
| Connect to a new ChirpStack server | Profile dropdown > Add Profile |
| Find a specific device | Devices > search bar or QR Scanner |
| Check if a device is healthy | Device Detail > Health tab |
| Send a command to a device | Device Detail > Commands tab |
| Test or debug a payload codec | Device Detail > Info tab > Codec Helper |
| View decoded sensor telemetry | Device Detail > Sensors tab |
| Back up or restore contacts | Settings > Backups > Contacts Backup |
| See device locations on a map | Devices > Map view toggle |
| Get notified about offline devices | Alerts > Rules > New Rule |
| Ask AI about a problem | Home > AI Troubleshooter |
| Inspect devices in the field | Home > Site Visit |
| Share my server config with a teammate | Profiles > Export Profiles |
| Create a field tech invite | Profiles > Field Tech Access |
| Import a field tech invite | Profiles > QR scanner icon |
| Adjust a field tech's credits or app access | Profiles > Edit Access on the profile card |
| Compare underperforming devices | Devices > Compare mode > Compare |


> **Technical aside (dry humor):** Streaming ChirpStack on Android without a server is like trying to sip coffee through a fire hose that keeps deciding it's actually a bucket. gRPC-Web wants a steady stream, Android's network stack wants to buffer everything forever, and you're left building a tiny browser inside your app just to convince it to drip bytes. It works… eventually… in the same way duct tape counts as a protocol.
