---
sidebar_position: 5
title: "Device Frames & Events"
description: "Embedded frames and events in the Device Details screen"
unlisted: true
---

# Device Frames & Events in Device Details (More Tab)

This document describes the UX change to keep device context visible while browsing Frames and Events by embedding those views into the Device Details screen under the More tab.

## Why

- Keep device identity (name + DevEUI) always visible in the fixed header
- Reduce navigation complexity (no separate screens/back navigation)
- Better screenshots and shareability with device context included
- Keep all device-related views consolidated under one screen

## What Changed

- Added two new components:
  - `src/components/device-tabs/DeviceFramesTab.tsx` – live LoRaWAN frames stream view
  - `src/components/device-tabs/DeviceEventsTab.tsx` – live device events view with uplink/downlink filter
- Updated `DeviceDetailScreen` More tab to include a simple 3-way selector:
  - Charts (existing charts & predictions)
  - Frames (new embedded frames view)
  - Events (new embedded events view)
- Removed navigation to separate `DeviceFrames` and `DeviceEvents` screens from the More tab.

## How to Use

1. Open a device (Device Details)
2. Go to the "More" tab
3. Use the selector at the top to switch between:
   - 📊 Charts (default)
   - 📡 Frames
   - 📋 Events

The device header remains fixed at the top of the screen for context.

## Build/Run

- Start the app as usual:
  - `npm start`
  - `npm run android` or `npm run ios`

## Implementation Notes

- Frames/events are streamed via `InternalServiceClient` using gRPC-Web
- Both streams limit in-memory list sizes to the most recent 100 entries
- Events tab supports direction filter (All, Uplink, Downlink)
- Tapping payload/body opens the existing `EventDetails` screen for full-screen view

## Files Changed

- `src/screens/DeviceDetailScreen.tsx`
  - More tab now renders a view selector and conditionally renders Charts/Frames/Events
  - Minor styling additions for selector buttons
- `src/components/device-tabs/DeviceFramesTab.tsx` (new)
- `src/components/device-tabs/DeviceEventsTab.tsx` (new)
- `src/components/device-tabs/index.tsx` (exports updated)

## Commit

- feat: integrate Frames and Events into Device Details More tab
