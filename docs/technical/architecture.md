---
sidebar_position: 1
title: Architecture Overview
description: High-level app architecture, state, and data flow
---

# LoRACK! Architecture Overview

This page describes the current high-level architecture of the LoRACK! mobile app.

## System Diagram

```
React Native App (Expo)
  App.tsx -> BootCoordinator -> AppNavigator
      |              |             |
      |              |             +-> Screens (src/screens/*)
      |              |
      |              +-> Hydration + startup orchestration
      |
      +-> Zustand Stores (profile, ui, session, alerts)
           -> AsyncStorage persistence
           -> SecureStore-backed secret references

Services Layer
  - ChirpStack gRPC-Web wrappers (src/services/chirpstack-grpc.ts)
  - MoD AI REST client (src/services/troubleshooter-service.ts)
  - Frame/event caching and telemetry parsing services

Backends
  - ChirpStack v4 (gRPC-Web)
  - MoD AI / modencode (REST/JSON, optional)
```

## Navigation Model

LoRACK! uses a stack navigator in `src/navigation/AppNavigator.tsx` with lazy-loaded route screens for faster startup.

Primary route groups:

- Core: Home, Applications, Devices, DeviceDetail, Gateways
- Operations: AddDevice, DeviceKeys, SenseCAP Provisioning, Commands
- Monitoring: Alerts, Alert Rules, Health Metric Detail
- Support: AI Troubleshooter, Help, Streaming Debug
- Team workflows: Profiles, Field Tech Access, Contacts, Site Visits

## State and Persistence

The app uses persisted Zustand stores in `src/stores/`:

| Store | Responsibility |
|------|----------------|
| `profile.ts` | Multi-server profiles, tenants, permissions metadata |
| `ui.ts` | Theme mode, startup preferences, navigation state |
| `session.ts` | Active profile/session and connection status |
| `alerts.ts` | Alert rules and alert lifecycle state |

Sensitive fields (for example API tokens) are managed through `src/services/profile-secrets.ts` using SecureStore on native platforms with an AsyncStorage fallback on web.

## Service Wrapper Pattern

ChirpStack integration follows a strict wrapper approach (`src/services/chirpstack-grpc.ts`):

1. Build protobuf request objects.
2. Call generated gRPC-Web client methods.
3. Map protobuf responses into domain interfaces.
4. Return plain objects for screens/components.

MoD integration is optional and REST-based (`src/services/troubleshooter-service.ts`). AI features are hidden or degraded gracefully when endpoint/token configuration is missing.

## Telemetry, Frames, and Health Data

LoRACK! combines stream/cache sources to support both live and resilient views:

- Frames and events are cached in local storage services for recent history and offline resilience.
- `useFrameCache`, `useBackgroundEventCache`, and `useDeviceTelemetry` coordinate background updates and parsed telemetry extraction.
- Health scoring uses battery, connectivity, signal, and data-quality dimensions.
- Battery resolution prioritizes explicit telemetry percentages when present, then falls back to voltage and other sources.

## Key Files

- `src/services/chirpstack-grpc.ts`: ChirpStack domain service wrappers
- `src/services/troubleshooter-service.ts`: MoD AI client
- `src/services/profile-storage.ts`: Profile schema and persistence helpers
- `src/services/profile-secrets.ts`: Secure token storage
- `src/stores/profile.ts`: Profile and permission state
- `src/stores/ui.ts`: Theme/navigation preferences
- `src/components/BootCoordinator.tsx`: Startup and hydration flow
