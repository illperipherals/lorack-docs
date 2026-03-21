---
draft: true
sidebar_position: 6
title: Changelog
description: All notable changes to LoRACK!
---

# Changelog

All notable changes to LoRACK! are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).


## [1.0.3] — 2026-03-20

### Added

- **Codec Helper** — test and debug device profile payload codecs with live editing, side-by-side comparison, and recent payload loading
- **Application editing** — edit application name and description from the application detail screen
- **Alert detail & rules** — tap an alert to view full details; manage alert rules with create, edit, enable/disable, and delete
- **Contacts Backup** — export, import, and manage contact backups from Settings with optional photo inclusion
- **Help screen** — in-app help with links to documentation and support contact
- **ProfileContacts** — attach contacts directly to server profiles for admin/owner tracking
- **Survey device tagging** — mark devices as survey devices; badge appears in header and device list for at-a-glance context
- **Data tab simplification** — consolidated Frames and Events into a single Data tab with sub-tabs

---

## [1.0.2] — 2026-03-12

### Added

- Click field titles in frame/event drilldowns to copy values

### Changed

- Device detail tabs reordered to Health → Info → Sensors → Data → Commands
- Health is now the default device detail tab

---

## [1.0.1] — 2026-03-12

### Added

- Alerts severity filter toggles in the summary bar
- QR AppKey auto-fill into device key setup
- Enable/disable device action in the device overview

### Changed

- Streaming debug screen styled as a console log view with timestamp columns
- Streaming log descriptions suppress trivial uplink/downlink labels

### Fixed

- Battery telemetry now prefers explicit percentage over voltage-derived level
- Battery health tile uses resolved telemetry for consistency with details view
- AI troubleshooter battery status falls back to voltage when percent is missing
- External power flags from frame telemetry are respected in battery resolution

---

## [1.0.0] — 2026-03-02

### Initial Release

LoRACK! v1.0 — a mobile app for LoRaWAN network management via ChirpStack with optional MoD AI diagnostics. Runs on iOS, Android, and Web.

### Features

**Device Management**
- View and manage LoRaWAN devices with filtering, sorting, and map view
- Device detail screen with Info, Health, Commands, and More (Frames/Events) tabs
- QR code scanning for rapid device lookup and onboarding
- Add devices manually or via QR code with DevEUI/JoinEUI pre-fill
- Device key configuration (OTAA and ABP activation modes)
- Send downlink commands with configurable FPort and confirmed delivery
- Device comparison — compare health metrics across 2–4 devices side by side
- TR005 QR code parsing for LoRa Alliance device identification tags

**Device Health and Diagnostics**
- Overall device health scoring with four component metrics:
  - Battery: voltage level, chemistry detection, drain trends
  - Connectivity: last-seen recency, message rate, gateway coverage
  - Signal: RSSI, SNR, link margin quality
  - Data Quality: message gaps, duplicates, error rates
- Drill-down charts with configurable time ranges and trend indicators
- Fleet health summary across all devices in an application

**Applications and Gateways**
- Application management (create, edit, delete) with tenant support
- Gateway monitoring with location editing and last-seen tracking
- Optional Helium Hotspot integration
- Live uplink frames and device event streaming via gRPC-Web

**Alerts and Monitoring**
- Alert system with Critical, Warning, and Info severity levels
- Tabbed alert views: All, Active, Acknowledged, Resolved
- Configurable alert rules with custom thresholds
- Inline acknowledge/resolve actions and bulk clear

**AI-Powered Troubleshooting (MoD)**
- Natural language chat interface for device diagnostics
- Quick-action buttons: Health, Battery, Signal, Connectivity checks
- Automatic issue detection for common problems (offline, poor signal, battery drain)
- Metric-based recommendations with links to device details
- Persistent chat history (up to 50 messages per session)

**Contacts and Photos**
- Attach contacts and photos to devices, applications, and gateways
- Primary photo selection with zoom and pan
- Profile-wide address book
- Contact import/export with optional image inclusion

**Command Library**
- Reusable downlink command templates organized by category
- Support for HEX, Template, and JSON payload formats
- Import/export command libraries as JSON

**Site Visits**
- Per-application device checklists for field technicians
- Progress tracking with completion percentages
- Per-device notes and checklist items
- Shareable visit reports

**Profiles and Multi-Server**
- Multiple ChirpStack server profiles with quick switching
- Profile import/export for team onboarding (merge or replace)
- Auto-discover tenants or manual tenant ID entry
- Secure API token storage via SecureStore

**Field Technician Access**
- Read-only profiles with restricted API tokens
- Field tech invite flows for sharing limited access

**Settings and Customization**
- Theme selection: Light, Dark, Night (red-shifted), System auto
- Configurable startup screen: Home, Devices, or QR Scanner
- Optional state restore to resume last screen on launch
- Toggle to auto-fetch device keys on detail view

### Technical

- Direct gRPC-Web connection to ChirpStack v4 (no proxy required)
- REST/JSON integration for MoD AI backend
- Offline-first with AsyncStorage persistence and frame/event caching
- React Native 0.83.2 with Expo SDK 55
- Hermes JavaScript engine with New Architecture enabled
- Lazy-loaded screens for fast startup
- Zustand state management with persist middleware

### Supported Platforms

- iOS 17.0+
- Android 7.0+ (API 24)
- Web (modern browsers)
