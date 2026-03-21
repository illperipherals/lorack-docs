---
draft: true
sidebar_position: 1
title: Quick Start
description: Connect to ChirpStack in 5 minutes
---

# Quick Start Guide

Get LoRACK! connected to your ChirpStack server in under 5 minutes.

## How It Works

LoRACK! connects directly to ChirpStack using gRPC-Web. ChirpStack v4 includes built-in gRPC-Web support via `tonic_web::GrpcWebLayer`, so **no proxy is required**.

```
[LoRACK! App] --gRPC-Web--> [ChirpStack Server]
  (your phone)              (chirpstack.example.com:8080 or :443)
```

## Prerequisites

- A running ChirpStack v4 server accessible from your device
- A ChirpStack API token (generated in the ChirpStack web UI under **API Keys**)
- The server address and port

## Step 1: Launch the App

Install LoRACK! on your device or run from source:

```bash
npm install
npm start
```

Then press `i` for iOS, `a` for Android, or `w` for web.

## Step 2: Add a Server Profile

1. On the Home screen, tap the profile dropdown at the top.
2. Choose **Add Profile**.
3. Enter your server details:

| Field | Example | Notes |
|-------|---------|-------|
| **Server Address** | `chirpstack.example.com:8080` | Always include the port number |
| **Use TLS** | Off | Off for HTTP (`:8080`), On for HTTPS (`:443`) |
| **API Token** | `eyJ0eXAiOi...` | Full token from ChirpStack API Keys |

4. Tap **Discover Tenants** to auto-detect your tenants, or enter a tenant ID manually.
5. Save the profile.

> **TLS/Port Rule**: HTTP on `:8080` with TLS off. HTTPS on `:443` with TLS on. The port must always be specified explicitly — gRPC-Web does not infer default ports.

## Step 3: Test the Connection

Navigate to **Applications** or **Gateways** from the Home screen. If your data appears, you're connected.

The connection status indicator at the top of the Home screen shows:
- **Green** — Connected
- **Yellow** — Read-only access
- **Red** — Disconnected or authentication error

## Step 4 (Optional): Configure MoD AI

To enable AI-powered device diagnostics:

1. Go to **Settings > Edit Profile**.
2. Scroll to **MoD AI (Optional)**.
3. Enter the MoD endpoint (e.g., `mod.example.com:443`) and API token.
4. Save — the AI Troubleshooter button will appear on the Home screen.

## Next Steps

- **Scan a QR code**: Tap the QR icon on the Home screen to quickly find devices.
- **Check device health**: Open any device; Health is the default tab.
- **Set up alerts**: Go to Alerts to configure monitoring rules.
- **Add contacts**: Attach photos and contact info to devices for field identification.
- **Explore the AI Troubleshooter**: Ask natural language questions about device issues.
- **Inspect raw data**: Use the Data tab (Frames/Events); tap a field title to copy its value.

## Troubleshooting Connection Issues

### "Connection failed" or "Service unavailable"

- Verify your server address is correct (`host:port` format)
- Confirm TLS setting matches the port (off for 8080, on for 443)
- Ensure ChirpStack is running and the gRPC port is open
- Check that your device can reach the server (firewall rules, VPN, etc.)
- Test with curl: `curl http://your-server:8080` or `curl https://your-server:443`

### "Authentication failed"

- Verify your API token is correct and hasn't expired
- Re-copy the token from ChirpStack (ensure no extra whitespace)
- Confirm the token has the necessary permissions

### TLS Certificate Issues

- Self-signed certificates may require installing the CA certificate on your device
- Production deployments should use certificates from a trusted CA (e.g., Let's Encrypt)

## Production Deployment Checklist

- [ ] Use HTTPS (TLS enabled) with a valid certificate
- [ ] Ensure firewall allows mobile clients to reach the ChirpStack gRPC port
- [ ] Generate API tokens with appropriate permissions (admin or tenant-scoped)
- [ ] Test from a device outside your network to confirm external accessibility
- [ ] Optionally configure MoD AI for diagnostics
