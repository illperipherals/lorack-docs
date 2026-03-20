---
sidebar_position: 1
title: "Data Flow Architecture"
description: "How frame and event data flows through LoRACK!"
unlisted: true
---

# Frame/Event Data Flow Architecture

This document describes how LoRaWAN frame and event data flows through the LoRACK! mobile app.

## Overview

ChirpStack provides two streaming endpoints for device telemetry:

| Endpoint | Purpose | Data Contents |
|----------|---------|---------------|
| `StreamDeviceFrames` | Raw LoRaWAN frames | RSSI, SNR, frequency, DR, direction |
| `StreamDeviceEvents` | Decoded payloads | Sensor telemetry, battery voltage, location |

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ChirpStack Server                               │
│  ┌─────────────────────┐    ┌─────────────────────┐                 │
│  │ StreamDeviceFrames  │    │ StreamDeviceEvents  │                 │
│  │  (gRPC-Web stream)  │    │  (gRPC-Web stream)  │                 │
│  └──────────┬──────────┘    └──────────┬──────────┘                 │
└─────────────┼───────────────────────────┼───────────────────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│   useFrameCache hook    │  │ useBackgroundEventCache │
│  (src/hooks/)           │  │  (src/hooks/)           │
└──────────┬──────────────┘  └──────────┬──────────────┘
           │                            │
           ▼                            ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│     frameCache          │  │      eventCache         │
│  (frame-cache.ts)       │  │  (event-cache.ts)       │
│  • 1000 frames/device   │  │  • 100 events/device    │
│  • 1hr TTL              │  │  • 1hr TTL              │
│  • AsyncStorage backed  │  │  • AsyncStorage backed  │
└──────────┬──────────────┘  └──────────┬──────────────┘
           │                            │
           ▼                            ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│ frame-metrics-extractor │  │   frame-data-parser     │
│  • extractRssiFromFrames│  │  • parseFrameData()     │
│  • extractSnrFromFrames │  │  • parseTelemetryObject │
│  • extractPacketCounts  │  │  • parseGatewayRxInfo   │
│  • extractLinkMargin    │  │                         │
└──────────┬──────────────┘  └──────────┬──────────────┘
           │                            │
           └──────────┬─────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           UI Layer                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ DeviceHealthTab  │  │ DeviceTelemetry  │  │HealthMetricDetail│   │
│  │  (health scores) │  │  (sensor data)   │  │  (charts)        │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Source Responsibilities

### Frames (Raw LoRaWAN)
Use `frameCache` and `frame-metrics-extractor.ts` for:
- **RF metrics**: RSSI, SNR, spreading factor
- **Link quality**: Link margin calculation
- **Packet statistics**: Uplink/downlink counts, error counts
- **Gateway discovery**: Which gateways received the device

### Events (Decoded Payloads)
Use `eventCache` and `frame-data-parser.ts` for:
- **Sensor telemetry**: Temperature, humidity, pressure, CO2, etc.
- **Battery data**: Voltage and level from device codec
- **Location**: GPS coordinates from devices
- **Contact sensors**: Door/window state, motion, occupancy

## Battery Telemetry Resolution

Battery data is resolved via `battery-telemetry.ts` with this priority:

1. **Frame telemetry** (from `useDeviceTelemetry` hook via events)
2. **Backend** (ChirpStack aggregated metrics API)
3. **Device status** (gRPC DeviceStatus)
4. **Link metrics** (gRPC LinkMetrics)

### Voltage-to-Level Conversion

Different battery chemistries have different voltage curves:

| Profile ID | Chemistry | Nominal | Range |
|------------|-----------|---------|-------|
| `lipo_1s_generic` | Li-ion/LiPo | 3.7V | 3.0-4.2V |
| `lifepo4_1s_generic` | LiFePO4 | 3.2V | 2.5-3.65V |
| `lifepo4_4s_12v` | LiFePO4 4S | 12.8V | 10.0-14.6V |
| `li_socl2_er26500_spc1520` | Li-SOCl2 | 3.6V | 2.7-3.6V |
| `li_socl2_er34615_sensecap` | Li-SOCl2 | 3.6V | 2.0-3.65V |

Set `battery_profile` tag on devices in ChirpStack to enable accurate conversion.

## Screen Data Sources

| Screen | Frame Data | Event Data |
|--------|------------|------------|
| DeviceFramesScreen | ✅ Direct stream | - |
| DeviceEventsScreen | - | ✅ Direct stream |
| DeviceHealthTab | ✅ Via cache | ✅ Via cache |
| HealthMetricDetailScreen | ✅ RF charts | ✅ Battery charts |
| DeviceTelemetry | - | ✅ Sensor display |

## Key Files

### Services
- `src/services/frame-cache.ts` - Frame caching with AsyncStorage
- `src/services/event-cache.ts` - Event caching with AsyncStorage
- `src/services/frame-metrics-extractor.ts` - RF metric extraction
- `src/services/frame-data-parser.ts` - Telemetry parsing
- `src/services/battery-telemetry.ts` - Battery level resolution

### Hooks
- `src/hooks/useFrameCache.ts` - Background frame streaming
- `src/hooks/useBackgroundEventCache.ts` - Background event streaming
- `src/hooks/useDeviceTelemetry.ts` - Telemetry extraction hook

### Tests
- `__tests__/battery-telemetry.test.ts` - Battery conversion tests
- `__tests__/frame-cache.test.ts` - Cache operation tests
- `__tests__/frame-metrics-extractor.test.ts` - RF extraction tests
- `__tests__/frame-data-parser.test.ts` - Telemetry parsing tests
