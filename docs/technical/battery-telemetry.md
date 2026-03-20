---
sidebar_position: 4
title: "Battery Telemetry"
description: "Battery level resolution, chemistry mapping, and telemetry standard"
unlisted: true
---

# Battery Telemetry Standard

## Goal

Provide a single, consistent source of truth for battery level, voltage, and
power source across all platforms (Android, iOS, Web) and all UI surfaces.

## Source Precedence (highest → lowest)

1. **Frame telemetry** (`frameTelemetry`)
   - Directly reported by the device payload.
   - If both percent and voltage are present, percent wins.
2. **Backend** (`backend`)
   - Server‑computed or aggregated values.
3. **Device status** (`device_status`)
   - ChirpStack device status fields.
4. **Link metrics** (`linkMetrics`)
   - Lowest‑fidelity source.

This precedence order is enforced in `resolveBatteryTelemetry()`.

## Normalization Rules

- Battery level is clamped to **0–100**.
- **100% is allowed** for all sources (no suppression).
- If only voltage is available, it is converted to percent using the
  chemistry mapping for the inferred battery profile.

## Chemistry and Voltage Mapping

Voltage → percent mapping is based on battery profile:

- `lipo_1s_generic`: 3.0V → 0%, 4.2V → 100%
- `lifepo4_1s_generic`: 2.5V → 0%, 3.65V → 100%
- `lifepo4_4s_12v`: 10.0V → 0%, 14.6V → 100%
- `li_socl2_er26500_spc1520`: 2.7V → 0%, 3.6V → 100% (non‑linear)
- `li_socl2_er34615_sensecap`: 2.0V → 0%, 3.65V → 100% (non‑linear)

Profiles are inferred from device tags and profile names
(`inferBatteryProfileId`). If unknown, we fall back to a generic Li‑ion curve.

### Tag-based chemistry hints

Battery chemistry can be passed via device/profile tags to make inference
explicit. The resolver looks at tags in this order:

- `batteryProfile` (preferred, exact match to a `BatteryProfileId`)
- `battery_profile`
- `batteryChemistry`
- `battery_chemistry`
- `batteryType`

Example tags:

```json
{
  "batteryProfile": "li_socl2_er34615_sensecap"
}
```

## External Power

`externalPowerSource` is propagated from the highest available source. It does
not suppress battery level display; it is only used for UI labeling and
health scoring.

## Consumed By

- Header battery pill and gauge
- Health tab + health scoring
- Troubleshooter analysis

All of these read from the same resolved `batteryTelemetry` object so values
remain consistent across screens and platforms.

## Code References

- Resolver: `src/services/battery-telemetry.ts`
- Telemetry extraction: `src/services/frame-data-parser.ts`
- Usage: `src/screens/DeviceDetailScreen.tsx`
