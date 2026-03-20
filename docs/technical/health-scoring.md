---
sidebar_position: 6
title: "Health Scoring Whitepaper"
description: "The LoRACK! Health Index (LHI): A framework for LoRaWAN device health classification"
---

# The LoRACK! Health Index (LHI): A Definitive Framework for LoRaWAN Device Health Classification

**Version 1.0 — March 2026**
**Authors:** LoRACK! Project Contributors
**Reference Implementation:** [LoRACK-AI-mobile](https://github.com/illperipherals/LoRACK-AI-mobile)

---

## Abstract

Low-Power Wide-Area Networks (LPWANs) built on LoRaWAN present unique challenges for device health assessment. Unlike traditional IP networks where connectivity is binary and bandwidth is abundant, LoRaWAN devices operate at the edge of receiver sensitivity, tolerate significant packet loss by design, and must balance link reliability against battery longevity measured in years. Existing monitoring tools reduce device health to simplistic "online/offline" status or raw RSSI thresholds—metrics that are inadequate for the physics of sub-GHz spread-spectrum communication.

This paper introduces the **LoRACK! Health Index (LHI)**, a composite scoring framework implemented in the LoRACK! open-source network management platform. LHI synthesizes four orthogonal health pillars—**Link Budget**, **Connectivity Behavior**, **Data Integrity**, and **Energy Budget**—into a single 0–100 score with full decomposability. We present the mathematical formulation, justify threshold selection from first principles of LoRa modulation, and propose extensions including **Temporal Coherence Analysis**, **Macro-Diversity Scoring**, and **Adaptive Duty-Cycle Awareness** that advance beyond current industry practice.

Our goal: a health metric that is *physically grounded*, *chemistry-aware*, *operationally actionable*, and *portable* across any LoRaWAN network server.

---

## Table of Contents

1. [Introduction & Motivation](#1-introduction--motivation)
2. [Why Existing Metrics Fail](#2-why-existing-metrics-fail)
3. [The Four Pillars of Device Health](#3-the-four-pillars-of-device-health)
4. [Pillar I: Link Budget Score](#4-pillar-i-link-budget-score)
5. [Pillar II: Connectivity Behavior Score](#5-pillar-ii-connectivity-behavior-score)
6. [Pillar III: Data Integrity Score](#6-pillar-iii-data-integrity-score)
7. [Pillar IV: Energy Budget Score](#7-pillar-iv-energy-budget-score)
8. [Composite Score & Staleness Decay](#8-composite-score--staleness-decay)
9. [Proposed Extensions](#9-proposed-extensions)
10. [Issue Detection & Severity Classification](#10-issue-detection--severity-classification)
11. [Fleet-Level Aggregation](#11-fleet-level-aggregation)
12. [Implementation Reference](#12-implementation-reference)
13. [Comparison with Existing Approaches](#13-comparison-with-existing-approaches)
14. [Conclusion](#14-conclusion)
15. [Appendix A: LoRa PHY Constants](#appendix-a-lora-phy-constants)
16. [Appendix B: Battery Chemistry Profiles](#appendix-b-battery-chemistry-profiles)
17. [Appendix C: Threshold Justification Tables](#appendix-c-threshold-justification-tables)

---

## 1. Introduction & Motivation

LoRaWAN has become the dominant LPWAN technology for IoT deployments spanning agriculture, utilities, smart cities, and industrial monitoring. As deployments scale from hundreds to tens of thousands of devices, operators face a fundamental question: **"Are my devices healthy?"**

This question is deceptively complex. A device reporting RSSI of -125 dBm may be operating perfectly well at SF12—or it may be on the verge of packet loss at SF7. A device that hasn't reported in 6 hours may be a failed unit—or a soil moisture sensor on a 12-hour reporting interval. A battery at 3.1V may have months of life on a LiPo cell—or hours on a Li-SOCl₂ cell approaching its voltage cliff.

**The core problem:** device health in LoRaWAN is not a single measurement but an emergent property of the interaction between RF link physics, protocol behavior, application requirements, and electrochemistry.

### 1.1 Design Principles

The LoRACK! Health Index is built on five principles:

1. **Physics-first:** Thresholds derive from LoRa modulation characteristics, not arbitrary dBm values.
2. **Decomposable:** The composite score breaks down into independently meaningful sub-scores that map to distinct failure modes.
3. **Context-aware:** Scoring adapts to device configuration (SF, reporting interval, battery chemistry) rather than applying one-size-fits-all thresholds.
4. **Temporally honest:** Scores decay as data ages, preventing stale measurements from masking failures.
5. **Operationally actionable:** Every score maps to a concrete diagnostic path—not just "red/yellow/green" but *why* and *what to do about it*.

---

## 2. Why Existing Metrics Fail

### 2.1 RSSI Alone Is Insufficient

Most LoRaWAN platforms display raw RSSI and apply fixed thresholds (e.g., >-100 dBm = "good"). This fails for two reasons:

**Problem 1: RSSI ignores spreading factor context.** LoRa's processing gain varies by ~15 dB across SF7–SF12. A signal at -130 dBm is catastrophic at SF7 (sensitivity: -123 dBm for 125 kHz BW) but has 7 dB of margin at SF12 (sensitivity: -137 dBm). RSSI without SF is like reporting speed without knowing the speed limit.

**Problem 2: RSSI doesn't capture interference.** In-band interference from other LoRa transmissions, narrowband interferers, or impulse noise degrades the signal-to-noise ratio without necessarily affecting RSSI. A device can report "excellent" RSSI while experiencing catastrophic SNR due to a co-channel interferer.

### 2.2 Online/Offline Is a Lagging Indicator

Binary connectivity status (last seen < threshold → online) tells you a device *was* working at some point in the past. It cannot:
- Detect gradual degradation before failure
- Distinguish between "device is transmitting but network isn't receiving" and "device has stopped transmitting"
- Account for expected reporting intervals

### 2.3 Battery Percentage Without Chemistry Is Meaningless

Li-SOCl₂ cells (the dominant LoRaWAN battery chemistry) have a nearly flat voltage curve at 3.6V for 90%+ of their life, then a precipitous "cliff" near 3.0V before rapid failure. Reporting "85% battery" based on linear voltage interpolation between 2.7V–3.6V gives false confidence—the device may have weeks of life, or it may be on the cliff edge. Without chemistry-specific voltage-to-capacity mapping, battery health is fiction.

### 2.4 No Standard Exists

The LoRa Alliance's Device Management specification defines telemetry transport but does not prescribe health scoring. ChirpStack, TTN, Actility, and other network servers expose raw metrics without composite health assessment. Every operator builds ad-hoc dashboards with inconsistent thresholds. The industry needs a common language.

---

## 3. The Four Pillars of Device Health

LHI decomposes device health into four orthogonal pillars, each capturing a distinct failure domain:

| Pillar | What It Measures | Primary Failure Mode |
|--------|-----------------|---------------------|
| **Link Budget** | RF link quality relative to demodulation threshold | Signal degradation, interference, antenna failure |
| **Connectivity Behavior** | Temporal communication patterns | Device failure, network misconfiguration, obstruction |
| **Data Integrity** | Protocol-level reliability | Firmware bugs, replay attacks, network congestion |
| **Energy Budget** | Power source viability | Battery depletion, power supply failure |

The pillars are weighted and combined into the composite LHI score:

```
LHI = (w_L × S_link + w_C × S_conn + w_D × S_data + w_E × S_energy) × P_stale
```

Where:
- `w_L, w_C, w_D, w_E` are pillar weights summing to 1.0
- `S_*` are pillar scores in [0, 100]
- `P_stale` is the staleness penalty in [0.05, 1.0]

**Default weights (battery known):** Link 30%, Connectivity 30%, Data 20%, Energy 20%
**Default weights (battery unknown):** Link 37.5%, Connectivity 37.5%, Data 25%

The asymmetric reweighting when battery is unknown prevents the score from being artificially inflated by omitting an unavailable pillar.

---

## 4. Pillar I: Link Budget Score

### 4.1 Link Margin: The Correct RF Health Metric

The central insight of LHI's signal quality assessment is that **link margin**—not RSSI, not SNR individually—is the physically meaningful measure of RF link health.

**Definition:** Link margin is the excess SNR above the minimum required for successful demodulation at the current spreading factor:

```
M = SNR_measured - SNR_required(SF)
```

Where `SNR_required` is the LoRa demodulation floor per the Semtech SX1276 datasheet:

| Spreading Factor | Required SNR (dB) | Receiver Sensitivity @ 125 kHz BW (dBm) |
|------------------|--------------------|------------------------------------------|
| SF7              | -7.5               | -123                                     |
| SF8              | -10.0              | -126                                     |
| SF9              | -12.5              | -129                                     |
| SF10             | -15.0              | -132                                     |
| SF11             | -17.5              | -134                                     |
| SF12             | -20.0              | -137                                     |

A device at SF10 with measured SNR of -5 dB has link margin = -5 - (-15) = **+10 dB**. This is fundamentally more informative than either the raw SNR or RSSI alone.

### 4.2 Link Margin Quality Classification

```
Margin ≥ 15 dB  →  Excellent   (robust against deep fades)
Margin ≥ 10 dB  →  Good        (comfortable headroom for seasonal variation)
Margin ≥  5 dB  →  Fair        (operational but vulnerable to interference)
Margin ≥  0 dB  →  Marginal    (at demodulation threshold; packet loss expected)
Margin <  0 dB  →  Poor        (below demodulation threshold; link is failing)
```

**Threshold justification:**
- The 15 dB "excellent" threshold accounts for typical urban multipath fading margins (10–15 dB Rayleigh fade depth at 868/915 MHz) plus seasonal foliage attenuation (3–6 dB deciduous canopy at 915 MHz).
- The 5 dB "fair" boundary represents the practical minimum for reliable operation in environments with occasional interference.
- The 0 dB boundary is the physical demodulation limit—below this, the LoRa chirp spread spectrum correlator cannot reliably extract the signal.

### 4.3 Link Margin to Score Conversion

```
S_margin = clamp(0, 100, 50 + (M × 10/3))
```

This maps the -15 dB to +15 dB practical margin range to 0–100, with 0 dB margin mapping to score 50 (the boundary between "working" and "not working").

### 4.4 RSSI and SNR Sub-Scores

When spreading factor is unknown (preventing link margin calculation), we fall back to individual RSSI and SNR scoring:

**RSSI Score (0–100):**
```
S_rssi = clamp(5, 100, 100 × (RSSI - (-140)) / (-90 - (-140)))
```
Maps -140 dBm → 5 (near noise floor) to -90 dBm → 100 (excellent signal). The floor of 5 (not 0) reflects that even very weak signals may occasionally demodulate at high SF.

**SNR Score (0–100):**
```
S_snr = clamp(5, 100, 100 × (SNR - (-20)) / (10 - (-20)))
```
Maps -20 dB → 5 to +10 dB → 100.

### 4.5 Composite Link Budget Score

**With link margin available:**
```
S_link = 0.45 × S_margin + 0.30 × S_rssi + 0.25 × S_snr
```

Link margin dominates (45%) because it is the most physically meaningful metric. RSSI and SNR are retained because:
- RSSI captures absolute signal power (relevant for ADR decisions and gateway planning)
- SNR captures interference independently of signal level

**Without link margin (SF unknown):**
```
S_link = 0.60 × S_rssi + 0.40 × S_snr
```

### 4.6 Proposed Extension: Temporal Coherence Analysis

**Current limitation:** The link score uses point-in-time or averaged metrics. It does not capture *variability*, which is a critical indicator of link stability.

**Proposal:** Add a **temporal coherence coefficient** that penalizes high-variance links:

```
C_temporal = 1 - clamp(0, 0.3, σ_margin / (|μ_margin| + 1))
S_link_final = S_link × C_temporal
```

Where `σ_margin` is the standard deviation of link margin over the observation window and `μ_margin` is the mean. A link with 10 dB mean margin but ±8 dB swings is less healthy than one with 8 dB mean margin and ±2 dB variation. The clamp at 0.3 limits the maximum penalty to 30%.

**Implementation note:** This requires maintaining a rolling window of margin measurements, which the existing `frame-metrics-extractor.ts` already provides via `extractLinkMarginFromFrames()`.

---

## 5. Pillar II: Connectivity Behavior Score

### 5.1 Three-Factor Connectivity Model

Connectivity health is decomposed into three factors:

**Factor 1: Recency (40% weight)**

How recently the device communicated, normalized to its expected interval:

```
If expectedInterval is known:
  ratio = timeSinceLastSeen / expectedInterval
  S_recency = max(0, 100 × (1 - ratio/3))    // 0 at 3× expected interval

If expectedInterval is unknown (heuristic):
  < 30 min:    100  (actively communicating)
  30 min–1h:   85
  1–6h:        40   (might be long-interval device)
  6–24h:       15
  > 24h:       0    (almost certainly failed)
```

The ratio-based approach when the expected interval is known is critical. A soil sensor reporting every 4 hours that hasn't been seen in 3 hours is perfectly healthy; a motion sensor on a 5-minute heartbeat that hasn't been seen in 3 hours is dead.

**Factor 2: Message Frequency (35% weight)**

Compares actual uplink count against expected:

```
If expectedInterval known:
  expected_count = observationWindow / expectedInterval
  ratio = actual_count / expected_count
  S_frequency = clamp(0, 100, 100 × ratio)

If expectedInterval unknown (heuristic):
  0 msgs:      0
  1–5 msgs:    10 + (count × 6)   // 16–40
  5–20 msgs:   40 + ((count-5) × 2.67)  // 40–80
  20–48 msgs:  80 + ((count-20) × 0.71)  // 80–100
  48+ msgs:    100
```

**Factor 3: Gateway Coverage (25% weight)**

Number of gateways that received the device's transmissions:

```
0 gateways:   0   (no coverage — device is unreachable or silent)
1 gateway:    50  (single point of failure)
2 gateways:   85  (basic redundancy)
3+ gateways:  100 (robust macro-diversity)
```

**Composite:**
```
S_conn = 0.40 × S_recency + 0.35 × S_frequency + 0.25 × S_coverage
```

### 5.2 Proposed Extension: Heartbeat Regularity Index

**Current limitation:** Message frequency only counts total messages; it doesn't detect irregular patterns (e.g., bursting then going silent).

**Proposal:** Compute the **coefficient of variation** of inter-message intervals:

```
intervals = [t₁-t₀, t₂-t₁, ..., tₙ-tₙ₋₁]
CV = σ(intervals) / μ(intervals)

S_regularity = clamp(0, 100, 100 × (1 - CV))
```

A perfectly regular device has CV ≈ 0 (score 100). A bursty device has high CV (lower score). This replaces the simple frequency count with a more nuanced behavior assessment.

Integrate into connectivity:
```
S_conn = 0.35 × S_recency + 0.25 × S_frequency + 0.15 × S_regularity + 0.25 × S_coverage
```

---

## 6. Pillar III: Data Integrity Score

### 6.1 Penalty-Based Scoring

Data integrity starts at 100 and is reduced by observed anomalies:

| Anomaly | Penalty | Maximum | Rationale |
|---------|---------|---------|-----------|
| Frame counter gap | -2 per gap | -20 | Indicates lost uplinks or device reset |
| Duplicate frame | -1 per frame | -10 | May indicate retransmission loops |
| Error rate | -100 × rate | -30 | Direct measure of failed transmissions |
| Low ACK rate (confirmed mode) | -20 × (1 - rate) | -20 | Downlink path impairment |
| Join failure rate | -15 × (1 - rate) | -15 | OTAA negotiation problems |

**Confidence cap:** With fewer than 10 messages, the maximum score is capped:
```
If messageCount < 10:
  S_data = min(S_data, 10 × messageCount)
```

This prevents a device with 2 messages and no anomalies from scoring 100—we simply don't have enough data to be confident.

### 6.2 Proposed Extension: Frame Counter Monotonicity Check

**Current limitation:** Frame counter gaps are counted but not analyzed for *resets*. A frame counter that goes from 15000 to 1 indicates a device restart, which has different diagnostic implications than sequential gaps.

**Proposal:** Detect frame counter resets and treat them as a distinct anomaly:

```
If fCnt(t) < fCnt(t-1) - 10:  // Allow small backward jumps from reordering
  frameCounterResets += 1
  penalty += 5 per reset (max -15)
```

This captures firmware crashes, watchdog resets, and power cycling that the current gap analysis misses.

### 6.3 Proposed Extension: Payload Consistency Score

**New sub-metric:** Analyze decoded payload fields for consistency:

```
For each telemetry field over the observation window:
  If value is constant across all messages → suspicious (possible sensor failure)
  If value changes by >10σ in one step → anomaly (possible bit error or sensor glitch)
  If value is NaN/null when previously present → degradation

S_payload_consistency = 100 - (anomaly_count × 5) - (stuck_field_count × 10)
```

This catches silent sensor failures where the device continues transmitting but the data is meaningless (e.g., a stuck temperature sensor reporting 25.0°C indefinitely).

---

## 7. Pillar IV: Energy Budget Score

### 7.1 Chemistry-Aware Voltage Mapping

The energy score is the most chemistry-dependent pillar. LHI defines battery profiles with specific voltage-to-capacity curves:

**Li-SOCl₂ (Primary, non-rechargeable)**
- Dominant chemistry in LoRaWAN (Dragino, SenseCAP, many others)
- Nominal: 3.6V. Cutoff: 2.0–2.7V (varies by cell)
- **Cliff voltage: 3.0V** — below this, remaining capacity drops precipitously
- Voltage → capacity mapping is highly nonlinear: 3.6V–3.2V covers ~85% of capacity

```
For Li-SOCl₂:
  V > 3.4V  → 85-100% (most of operational life)
  3.2–3.4V  → 50-85%  (mid-life)
  3.0–3.2V  → 15-50%  (approaching cliff)
  V < 3.0V  → 0-15%   (on the cliff — imminent failure)
```

**LiPo (Rechargeable)**
- Linear(ish) mapping: 3.0V → 0%, 4.2V → 100%
- No cliff behavior; gradual degradation

**LiFePO₄ (Rechargeable)**
- Flat plateau at 3.2–3.3V (single cell)
- Nonlinear mapping with rapid transitions at endpoints

### 7.2 Battery Score

```
If external power: S_energy = 100
If battery percentage known (chemistry-corrected):
  S_energy = batteryLevel  // 0-100 directly

If only raw voltage available:
  S_energy = chemistryProfile.voltageToLevel(voltage)

If battery unknown: S_energy = -1 (excluded from composite)
```

### 7.3 Battery Drain Estimation

LHI performs linear regression on historical battery readings to project remaining life:

```
For Li-SOCl₂ (voltage-based regression):
  slope = linearRegression(timestamps, voltages)  // V/day
  daysRemaining = (currentVoltage - cliffVoltage) / |slope|

For other chemistries (level-based regression):
  slope = linearRegression(timestamps, levels)  // %/day
  daysRemaining = currentLevel / |slope|
```

**Confidence scoring:**
- Minimum 3 readings required
- Minimum 24-hour observation span
- Confidence = min(sampleConfidence, timeConfidence)
  - sampleConfidence: 3 readings → 0.3, 10+ readings → 1.0
  - timeConfidence: 1 day → 0.3, 7+ days → 1.0

### 7.4 Proposed Extension: Coulomb-Counting Equivalent via Duty Cycle

**Current limitation:** Voltage-based estimation is inherently imprecise for Li-SOCl₂ due to the flat voltage curve. A device at 3.55V could have 90% or 60% capacity remaining.

**Proposal:** Estimate energy consumption from duty cycle telemetry:

```
E_consumed = Σ (P_tx × T_tx + P_rx × T_rx + P_sleep × T_sleep)

Where:
  P_tx = transmit power consumption (from device class and TX power)
  T_tx = time-on-air per uplink (computable from SF, payload size, BW)
  P_rx = receive window power
  T_rx = RX1 + RX2 window duration (based on device class)
  P_sleep = sleep current × sleep duration

E_remaining = E_nominal(chemistry, cell_size) - E_consumed
S_energy_coulomb = 100 × E_remaining / E_nominal
```

This provides a *forward-looking* energy estimate independent of voltage measurement, which is especially valuable for Li-SOCl₂ cells where voltage provides almost no information until the cliff.

**Time-on-air calculation** (already derivable from frame metadata):
```
T_symbol = 2^SF / BW
N_preamble = 8 (LoRaWAN default)
PayloadSymbols = 8 + max(ceil((8PL - 4SF + 28 + 16 - 20H) / (4(SF - 2DE))) × (CR + 4), 0)
ToA = (N_preamble + 4.25 + PayloadSymbols) × T_symbol
```

### 7.5 Proposed Extension: Chemistry Auto-Detection

**Current limitation:** Battery chemistry must be manually configured per device profile.

**Proposal:** Infer chemistry from voltage trajectory patterns:

```
If max(voltage) > 4.0V → LiPo or Li-ion
If max(voltage) ∈ [3.5, 3.75] AND σ(voltage) < 0.05V over 30 days → Li-SOCl₂
If max(voltage) ∈ [3.2, 3.7] AND plateau detected at 3.2-3.35V → LiFePO₄
If max(voltage) > 10V → Multi-cell pack (infer from nominal)
```

This enables zero-configuration battery monitoring for new deployments.

---

## 8. Composite Score & Staleness Decay

### 8.1 Weighted Combination

```
S_base = w_L × S_link + w_C × S_conn + w_D × S_data + w_E × S_energy

Default weights (battery known):   w_L=0.30, w_C=0.30, w_D=0.20, w_E=0.20
Default weights (battery unknown): w_L=0.375, w_C=0.375, w_D=0.25, w_E=0 (excluded)
```

### 8.2 Staleness Penalty

As data ages, confidence in the health score decreases. LHI applies a multiplicative staleness decay:

```
Age < 1 hour:      P_stale = 1.0       (fresh data, full confidence)
1h – 24h:          P_stale = lerp(1.0, 0.85, (age - 1h) / 23h)
1 day – 7 days:    P_stale = lerp(0.85, 0.50, (age - 1d) / 6d)
7 days – 30 days:  P_stale = lerp(0.50, 0.20, (age - 7d) / 23d)
30 days – 90 days: P_stale = lerp(0.20, 0.05, (age - 30d) / 60d)
90+ days:          P_stale = 0.05      (effectively unknown)
```

**Rationale:** The piecewise linear decay is designed so that:
- A device reporting hourly suffers no penalty.
- A device on a 6-hour interval loses minimal confidence (P ≈ 0.97).
- After 7 days without data, the score is halved—enough to flag attention without crying wolf for devices with intermittent connectivity.
- After 90 days, the score is effectively zeroed. We know nothing useful about this device.

The floor of 0.05 (not 0.0) prevents division-by-zero issues in downstream calculations and preserves the last-known pillar breakdown for diagnostic purposes.

### 8.3 Final Composite

```
LHI = S_base × P_stale
```

### 8.4 Health Status Classification

| LHI Score | Status    | Operational Meaning |
|-----------|-----------|-------------------|
| 80–100    | Excellent | Fully operational, no action needed |
| 60–79     | Good      | Operational with minor concerns worth monitoring |
| 40–59     | Fair      | Degraded performance, investigation recommended |
| 20–39     | Poor      | Significant issues, intervention required |
| 0–19      | Critical  | Device is failing or has failed |

---

## 9. Proposed Extensions

Beyond the per-pillar extensions described above, we propose three systemic enhancements:

### 9.1 Macro-Diversity Score

**Motivation:** LoRaWAN's key resilience mechanism is spatial diversity—multiple gateways receiving the same uplink. Current scoring treats gateway count as a simple 0/1/2/3+ bucketing. A proper macro-diversity score should capture the *quality* of diversity.

**Proposal:**

```
For each uplink received by N gateways:
  Sort gateways by SNR: snr_1 ≥ snr_2 ≥ ... ≥ snr_N

  diversity_gain = snr_1 - snr_2  // Gap between best and second-best

  If N = 0: S_diversity = 0
  If N = 1: S_diversity = 25  // No diversity
  If N ≥ 2:
    S_diversity = 50 + min(50, 10 × N) - max(0, diversity_gain - 10) × 2
```

This penalizes deployments where the "second" gateway is barely receiving (large diversity gap) and rewards true redundancy where multiple gateways have comparable signal quality.

**Integration:** Replace the simple gateway_count factor in Connectivity Behavior with the macro-diversity score.

### 9.2 Adaptive Duty-Cycle Awareness

**Motivation:** In EU868 regions, regulatory duty-cycle limits (1% on most channels, 10% on g3 band) constrain how often devices can transmit. A device operating near its duty-cycle limit may appear "less connected" even though it's functioning optimally within regulatory constraints.

**Proposal:**

```
duty_cycle_utilization = actual_ToA / allowed_ToA_per_period

If utilization > 0.8:
  S_conn_adjusted = max(S_conn, 70)  // Device is duty-cycle limited, not failing
  Add INFO issue: "Device is near duty-cycle limit"
```

This prevents false "connectivity degradation" alerts for devices that are correctly throttling their transmissions.

### 9.3 Environmental Context Scoring

**Motivation:** RF propagation varies with environmental conditions. The same device may have excellent link margin in winter and marginal link margin in summer (foliage attenuation at sub-GHz frequencies is 3–12 dB depending on species density and leaf moisture content).

**Proposal:** If historical data spans seasonal boundaries, compute a **seasonal baseline**:

```
For each calendar month with ≥7 days of data:
  baseline_margin[month] = median(link_margins in that month)

seasonal_deviation = current_margin - baseline_margin[current_month]

If seasonal_deviation < -5 dB:
  Flag as "unusual degradation beyond seasonal norm"
Else if margin < threshold but seasonal_deviation ≈ 0:
  Flag as "expected seasonal degradation"
```

This distinguishes between "the link is getting worse" (antenna issue, new obstruction) and "it's June and the trees have leaves" (expected, will self-resolve).

### 9.4 Transmission Power Efficiency Index

**Motivation:** Many devices use ADR (Adaptive Data Rate) to optimize their TX power and spreading factor. A device transmitting at maximum power (+14 dBm or +20 dBm for US915) with minimal link margin is in a fundamentally different state than one achieving the same margin at minimum power.

**Proposal:**

```
If ADR enabled and TX power is known:
  headroom = maxTxPower - currentTxPower
  efficiency = linkMargin / (currentTxPower - minTxPower + 1)

  If headroom = 0 AND linkMargin < 5 dB:
    Flag WARNING: "Device at max TX power with marginal link"
  If headroom > 6 dB AND linkMargin > 15 dB:
    Flag INFO: "ADR could reduce TX power to save battery"
```

This captures a critical failure mode: devices that have exhausted their TX power budget and are still struggling.

---

## 10. Issue Detection & Severity Classification

LHI maps score decompositions to specific, actionable issues organized by severity:

### 10.1 Severity Levels

| Level | Meaning | Response Time |
|-------|---------|--------------|
| **CRITICAL** | Device is failing or has failed | Immediate investigation |
| **WARNING** | Degradation detected, failure likely without intervention | Investigate within 24–48 hours |
| **INFO** | Optimization opportunity or minor concern | Review at next maintenance window |

### 10.2 Issue Catalog

**Link Budget Issues:**
| Condition | Severity | Issue |
|-----------|----------|-------|
| Link margin < 0 dB | CRITICAL | "Below demodulation threshold — link is failing" |
| Link margin 0–5 dB | WARNING | "Marginal link margin — vulnerable to fading" |
| Link margin 5–10 dB | INFO | "Fair link margin — consider antenna optimization" |
| Margin trend < -3 dB/week | WARNING | "Link margin is degrading — investigate cause" |
| RSSI < -130 dBm | CRITICAL | "Extremely weak signal — near noise floor" |
| RSSI < -120 dBm | WARNING | "Weak signal — reduced reliability expected" |
| SNR < -15 dB | CRITICAL | "Severe interference or noise" |
| SNR < -7.5 dB | WARNING | "Elevated noise or interference" |
| Per-gateway worst SNR < -10 dB | WARNING | "Weak link to gateway [name]" |

**Connectivity Issues:**
| Condition | Severity | Issue |
|-----------|----------|-------|
| No data ever received | CRITICAL | "Device has never communicated" |
| Offline > 24 hours | CRITICAL | "Device offline for extended period" |
| Offline > 6 hours (short interval) | WARNING | "Device missed expected uplinks" |
| S_conn < 30 | CRITICAL | "Critical connectivity degradation" |
| S_conn < 50 | WARNING | "Poor connectivity health" |

**Data Integrity Issues:**
| Condition | Severity | Issue |
|-----------|----------|-------|
| Frame counter reset detected | WARNING | "Device restarted (frame counter reset)" |
| > 10 frame counter gaps | WARNING | "Significant packet loss detected" |
| > 5 duplicate frames | INFO | "Duplicate transmissions detected" |
| Error rate > 10% | WARNING | "High error rate" |
| ACK success rate < 30% | CRITICAL | "Downlink path severely impaired" |
| ACK success rate < 50% | WARNING | "Low acknowledgment success rate" |
| Join failure rate > 50% | WARNING | "Frequent join failures — check keys" |

**Energy Budget Issues:**
| Condition | Severity | Issue |
|-----------|----------|-------|
| Battery < 10% | CRITICAL | "Battery critically low" |
| Battery < 30% | WARNING | "Battery low — plan replacement" |
| Voltage below cliff (Li-SOCl₂) | CRITICAL | "Voltage at depletion cliff" |
| Drain rate projects < 30 days | WARNING | "Battery projected to deplete within 30 days" |

**Configuration Issues:**
| Condition | Severity | Issue |
|-----------|----------|-------|
| SF > 10 with ADR disabled | INFO | "High spreading factor — consider enabling ADR" |
| Single gateway coverage | WARNING | "No gateway redundancy" |
| Zero gateway coverage | CRITICAL | "No gateway can reach this device" |

---

## 11. Fleet-Level Aggregation

Individual device scores aggregate to fleet health dashboards:

### 11.1 Fleet Health Distribution

```
fleet_critical  = count(devices where LHI < 20) / total
fleet_poor      = count(devices where 20 ≤ LHI < 40) / total
fleet_fair      = count(devices where 40 ≤ LHI < 60) / total
fleet_good      = count(devices where 60 ≤ LHI < 80) / total
fleet_excellent = count(devices where LHI ≥ 80) / total

fleet_average_health = mean(LHI for all active devices)
```

### 11.2 Fleet Risk Score

Beyond averages, fleet operators need to understand tail risk:

```
fleet_risk = 100 × (2 × fleet_critical + fleet_poor) / (fleet_critical + fleet_poor + fleet_fair + fleet_good + fleet_excellent)
```

This weights critical devices 2× to surface fleet-wide problems.

### 11.3 Proposed Extension: Spatial Clustering

**Motivation:** When multiple devices in the same geographic area degrade simultaneously, the root cause is likely a gateway failure or environmental change, not individual device issues.

**Proposal:** If device locations are known:
```
For each device with LHI < 50:
  Find neighbors within 500m radius
  If ≥ 3 neighbors also have LHI < 50:
    Create cluster alert: "Possible gateway or area-wide issue affecting N devices near [location]"
```

---

## 12. Implementation Reference

The LoRACK! Health Index is fully implemented in the LoRACK! mobile application:

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| Type definitions | `src/types/troubleshooting.ts` | 221 | HealthScore, DeviceMetricsForAnalysis, issue types |
| Metric types | `src/types/metrics.ts` | 72 | Time-series, link margin, chart data structures |
| Link margin calculator | `src/services/link-margin-calculator.ts` | 310 | SF-aware margin computation, quality classification |
| Health analyzer | `src/services/device-analyzer.ts` | 658 | Four-pillar scoring engine, staleness, drain estimation |
| Issue detector | `src/services/issue-detector.ts` | 520 | Rule-based issue identification with severity levels |
| Metrics extractor | `src/services/frame-metrics-extractor.ts` | 461 | Frame data → structured time-series metrics |
| Battery telemetry | `src/services/battery-telemetry.ts` | 200+ | Chemistry-aware voltage/level conversion |
| Battery store | `src/services/battery-reading-store.ts` | 150+ | Persistent reading history with downsampling |
| Recommendation engine | `src/services/recommendation-engine.ts` | 150+ | Issue → actionable recommendation mapping |
| Troubleshooter orchestrator | `src/services/troubleshooter-service.ts` | 200+ | End-to-end analysis pipeline |
| Gateway analyzer | `src/services/gateway-analyzer.ts` | 97 | Gateway availability scoring |
| Health status utility | `src/utils/health-status.ts` | 60 | Score → status classification |
| Device health UI | `src/components/device-tabs/DeviceHealthTab.tsx` | 1400+ | Full health dashboard with decomposed scores |
| Metric detail UI | `src/screens/HealthMetricDetailScreen.tsx` | 1500+ | Drill-down per metric with charts and trends |
| Fleet summary | `src/components/FleetHealthSummary.tsx` | 150 | Fleet-wide health aggregation dashboard |

### 12.1 Data Flow

```
ChirpStack gRPC API
       │
       ▼
 Frame Cache (AsyncStorage)
       │
       ▼
 Frame Metrics Extractor ──→ DeviceMetricsForAnalysis
       │                              │
       ▼                              ▼
 Battery Reading Store         Device Analyzer
       │                         │    │    │    │
       ▼                         ▼    ▼    ▼    ▼
 Drain Estimation          Link  Conn  Data  Energy
                            │    │    │    │
                            ▼    ▼    ▼    ▼
                         Composite Health Score (LHI)
                                    │
                            ┌───────┼───────┐
                            ▼       ▼       ▼
                    Issue Detector  Trend  UI Dashboard
                            │     Analysis
                            ▼
                    Recommendation Engine
                            │
                            ▼
                    Actionable Guidance
```

### 12.2 Portability

LHI is designed to be network-server agnostic. The `DeviceMetricsForAnalysis` interface serves as the abstraction boundary—any LoRaWAN network server (ChirpStack, TTN, Actility, AWS IoT Core for LoRaWAN) can populate this structure from its own API, and the entire scoring pipeline operates identically downstream.

---

## 13. Comparison with Existing Approaches

| Feature | ChirpStack UI | TTN Console | Actility ThingPark | **LoRACK! LHI** |
|---------|--------------|-------------|--------------------|----|
| Composite health score | No | No | Limited | **Yes (0–100)** |
| SF-aware link margin | No | No | No | **Yes** |
| Chemistry-specific battery | No | No | Limited | **Yes (5 profiles)** |
| Battery drain projection | No | No | No | **Yes** |
| Staleness decay | No | No | No | **Yes** |
| Issue detection | No | No | Basic | **Yes (22+ rules)** |
| Actionable recommendations | No | No | No | **Yes** |
| Per-gateway signal analysis | Limited | No | Yes | **Yes** |
| Frame counter analysis | No | No | No | **Yes** |
| Trend analysis | No | No | No | **Yes** |
| Fleet aggregation | Basic | Basic | Yes | **Yes** |
| Offline/local operation | No | No | No | **Yes** |

---

## 14. Conclusion

The LoRACK! Health Index provides what the LoRaWAN industry has lacked: a rigorous, physics-grounded, decomposable health score that transforms raw telemetry into operational intelligence. By centering the framework on **link margin** rather than raw RSSI, applying **chemistry-specific** battery analysis, enforcing **temporal honesty** through staleness decay, and decomposing health into **four orthogonal pillars**, LHI enables operators to move from reactive firefighting to proactive fleet management.

The proposed extensions—temporal coherence analysis, macro-diversity scoring, duty-cycle awareness, coulomb-counting equivalent, and environmental context—represent the next frontier. We invite the LoRaWAN community to adopt, extend, and standardize this framework.

A healthy device is not one that is merely "online." It is one whose RF link has margin, whose communication pattern is consistent, whose data is reliable, and whose power source will sustain it. LHI measures all four.

---

## Appendix A: LoRa PHY Constants

### A.1 Spreading Factor Parameters (125 kHz Bandwidth)

| SF | Chips/Symbol | Bit Rate (bps) | Sensitivity (dBm) | Required SNR (dB) | Max Payload (bytes) | Time-on-Air 11B (ms) |
|----|-------------|-----------------|--------------------|--------------------|--------------------|-----------------------|
| 7  | 128         | 5,468           | -123               | -7.5               | 222                | 56.6                  |
| 8  | 256         | 3,125           | -126               | -10.0              | 222                | 102.9                 |
| 9  | 512         | 1,758           | -129               | -12.5              | 115                | 185.3                 |
| 10 | 1,024       | 977             | -132               | -15.0              | 51                 | 329.7                 |
| 11 | 2,048       | 537             | -134               | -17.5              | 51                 | 659.5                 |
| 12 | 4,096       | 293             | -137               | -20.0              | 51                 | 1,318.9               |

### A.2 Regional Parameters

| Region | Frequency Band | Max EIRP | Duty Cycle | Channels |
|--------|---------------|----------|------------|----------|
| EU868  | 863–870 MHz   | +16 dBm  | 0.1–10%    | 3+       |
| US915  | 902–928 MHz   | +30 dBm  | None (FCC Part 15) | 64 up + 8 down |
| AU915  | 915–928 MHz   | +30 dBm  | None       | 64 up + 8 down |
| AS923  | 923 MHz       | +16 dBm  | Varies     | 2+       |
| IN865  | 865–867 MHz   | +30 dBm  | None       | 3        |

### A.3 Typical Propagation Loss at Sub-GHz

| Environment | Path Loss Model | Typical Range (SF12) | Foliage Loss |
|-------------|----------------|---------------------|-------------|
| Urban dense | COST-231 Hata  | 2–5 km              | 6–12 dB     |
| Urban       | Okumura-Hata   | 3–8 km              | 3–8 dB      |
| Suburban     | Hata           | 5–12 km             | 2–6 dB      |
| Rural        | Free-space + ground reflection | 10–20 km | 1–3 dB |
| Indoor (1 floor) | ITU-R P.1238 | 200–500 m       | N/A         |
| Indoor (multi-floor) | ITU-R P.1238 | 50–200 m   | N/A         |

---

## Appendix B: Battery Chemistry Profiles

### B.1 Supported Profiles

| Profile ID | Chemistry | Nominal V | Cutoff V | Cliff V | Curve Type | Common Devices |
|-----------|-----------|-----------|----------|---------|------------|----------------|
| `li_socl2_er26500_spc1520` | Li-SOCl₂ | 3.60V | 2.70V | 3.00V | Flat + cliff | SenseCAP SPC1520 |
| `li_socl2_er34615_sensecap` | Li-SOCl₂ | 3.65V | 2.00V | 3.00V | Flat + cliff | SenseCAP S2103/S2104 |
| `lipo_1s_generic` | LiPo/Li-ion | 4.20V | 3.00V | N/A | Near-linear | Various rechargeable |
| `lifepo4_1s_generic` | LiFePO₄ | 3.65V | 2.50V | N/A | Flat plateau | Solar-powered nodes |
| `lifepo4_4s_12v` | LiFePO₄ 4S | 14.6V | 10.0V | N/A | Flat plateau | Industrial gateways |

### B.2 Li-SOCl₂ Discharge Characteristics

```
Voltage (V)
  3.7 |████████████████████████████████████████████████
  3.6 |████████████████████████████████████████████████  ← Flat plateau (85% of life)
  3.5 |████████████████████████████████████████████████
  3.4 |██████████████████████████████████████████
  3.3 |███████████████████████████████████
  3.2 |████████████████████████████
  3.1 |███████████████████
  3.0 |████████████               ← Cliff onset
  2.9 |██████
  2.8 |███
  2.7 |█                          ← Cutoff
      └──────────────────────────────────────────────
       0%    20%    40%    60%    80%    100%  Capacity
```

The cliff characteristic makes voltage-based SoC estimation unreliable for Li-SOCl₂ until the cliff is reached, which is why the proposed coulomb-counting extension (§7.4) is critical for this chemistry.

---

## Appendix C: Threshold Justification Tables

### C.1 Link Margin Thresholds vs. Expected Packet Delivery Rate

| Link Margin (dB) | Expected PDR (SF7) | Expected PDR (SF12) | LHI Quality |
|-------------------|--------------------|--------------------|-------------|
| +20               | >99.9%             | >99.9%             | Excellent   |
| +15               | >99.5%             | >99.9%             | Excellent   |
| +10               | >98%               | >99.5%             | Good        |
| +5                | >90%               | >98%               | Fair        |
| +3                | ~85%               | ~95%               | Fair        |
| 0                 | ~50%               | ~80%               | Marginal    |
| -3                | ~15%               | ~50%               | Poor        |
| -5                | \<5%               | ~30%               | Poor        |
| -10               | \<1%               | ~5%                | Poor        |

*PDR values are approximate and assume AWGN channel. Real-world PDR is lower due to fading and interference.*

### C.2 Staleness Decay Rationale

| Age | P_stale | Rationale |
|-----|---------|-----------|
| 0–1h | 1.0 | Fresh data; full confidence |
| 6h | 0.97 | Typical long-interval sensor; still confident |
| 12h | 0.93 | Acceptable for daily reporters |
| 24h | 0.85 | One missed cycle for hourly reporters; starting to worry |
| 3 days | 0.68 | Multiple missed cycles; degradation likely |
| 7 days | 0.50 | Half-life; device may be failed or intermittent |
| 14 days | 0.37 | Strong suspicion of failure |
| 30 days | 0.20 | Almost certainly offline |
| 90+ days | 0.05 | Effectively unknown; data is historical only |

### C.3 Gateway Coverage vs. Network Resilience

| Gateway Count | Availability Impact | LHI Coverage Score | Rationale |
|---------------|--------------------|--------------------|-----------|
| 0 | No connectivity | 0 | Device cannot communicate |
| 1 | Single point of failure | 50 | One gateway outage = total loss |
| 2 | Basic redundancy | 85 | Survives single gateway failure |
| 3+ | Robust | 100 | Multi-path diversity; survives infrastructure events |

---

*This whitepaper describes the LoRACK! Health Index as implemented in the LoRACK! open-source project. The framework is released under the same license as the parent project and is intended for adoption and standardization by the LoRaWAN community.*
