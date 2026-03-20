---
sidebar_position: 2
title: "gRPC-Web Streaming"
description: "Cross-platform streaming architecture for Android, iOS, and Web"
---

# gRPC-Web Streaming Architecture

## Overview

LoRACK! uses gRPC-Web server-streaming RPCs to receive live device frames and
events from ChirpStack. A server-streaming RPC keeps a single long-lived HTTP
connection open and pushes protobuf-encoded messages to the client as they
arrive — conceptually equivalent to a real-time log tail.

The challenge is that this app runs on three very different runtimes (Android,
iOS, and Web browser), each with different native networking stacks, and the
"obvious" approach of using `fetch` + `ReadableStream` only works reliably on
one of them.

---

## How gRPC-Web Streaming Works (the ideal path)

ChirpStack's server uses `tonic_web::GrpcWebLayer` which speaks both native
gRPC (HTTP/2 framing) and gRPC-Web (HTTP/1.1 compatible). The gRPC-Web wire
format wraps each protobuf message in a 5-byte frame header:

```
[0x00]  [length: 4 bytes big-endian]  [protobuf payload: N bytes]
```

Trailers (end-of-stream metadata including gRPC status code) are sent as a
special frame with the high bit of the flag byte set (`0x80`):

```
[0x80]  [length: 4 bytes big-endian]  [trailer text: grpc-status:0\r\n...]
```

On the ideal path, the client:

1. Makes an HTTP POST with `Content-Type: application/grpc-web+proto`
2. Sends the serialized protobuf request wrapped in a gRPC-Web frame as the
   body
3. Receives the response as a stream of bytes
4. Reassembles frames as bytes arrive (they may split across chunk boundaries)
5. Deserializes each data frame's payload with `LogItem.deserializeBinary()`
6. Emits events on the `GrpcStreamLike<T>` interface

For the **Web** platform this works exactly as described using the browser's
native `fetch` + grpc-web library. The browser's networking stack delivers
`ReadableStream` chunks incrementally from HTTP/1.1 chunked transfer encoding.

---

## The Android Problem

### Root cause: OkHttp buffers binary response bodies

React Native for Android uses **OkHttp** as its HTTP client. OkHttp is an
excellent library, but it has a behavior that breaks binary streaming: for
`application/grpc-web+proto` (and any other `application/octet-stream`-like
content type) responses, OkHttp **buffers the entire response body in memory
before delivering it** to the JavaScript layer.

This means that on a server-streaming RPC — which sends data for minutes or
hours and only finishes when the client disconnects — OkHttp would buffer
forever and never deliver a single byte to the `ReadableStream` reader.

The practical symptom is: `response.body.getReader().read()` hangs indefinitely
on Android. The first chunk never arrives.

### Why this doesn't affect iOS

Apple's `URLSession` (used by Expo's native fetch on iOS) correctly streams
binary response bodies. Each chunk of data from the server is delivered to the
`ReadableStream` as it arrives over the socket. The iOS path works cleanly.

### Why text/base64 breaks the buffering

OkHttp applies the binary-buffering optimization based on content type. For
**text** content types (`text/plain`, `application/grpc-web-text`), OkHttp
*can* deliver data incrementally. However, in practice, React Native's Android
stack still exhibits stalls for long‑lived streaming responses, so the app
avoids relying on OkHttp for streaming.

The gRPC-Web specification defines an alternate encoding called **grpc-web-text**
where each gRPC frame is base64-encoded before being sent over the wire. The
client sets:

```
Content-Type: application/grpc-web-text
Accept: application/grpc-web-text
```

And receives back a base64 string instead of binary bytes. OkHttp delivers this
incrementally via XHR's `onprogress` / `onreadystatechange` events.

---

## The Transport Decision

```
Platform.OS === 'web'     → grpc-web InternalServiceClient (standard library)
Platform.OS === 'android' → WebViewStreamBridge (browser fetch + grpc-web-text)
                              └─ fallback: WebView XHR
                              └─ fallback: RN XHR (if bridge not mounted)
Platform.OS === 'ios'     → createFetchStream()    (expo/fetch + binary)
```

---

## Android Transport: WebView Bridge (grpc-web-text)

### Why a WebView bridge

The WebView (Chromium) networking stack reliably streams text responses and
delivers incremental `ReadableStream` chunks. React Native’s native networking
stack does not, so we move streaming into a hidden WebView.

The bridge is implemented by:
- `src/components/WebViewStreamBridge.tsx` (hidden WebView)
- `src/services/webview-stream-bridge.ts` (bridge protocol + gRPC framing)

The WebView runs with a **baseUrl set to the ChirpStack origin**, so fetch/XHR
requests are same‑origin (no CORS issues). If baseUrl is missing, WebView
defaults to `origin=null` and fetch will fail.

### Incremental parsing with a cursor

We track a `base64Remainder` when a chunk ends mid 4‑char block. The next chunk
is prepended before decoding so base64 stays aligned.

### Base64 decoding complexity

tonic-web (ChirpStack's server library) encodes each gRPC frame separately
before streaming it. This produces concatenated base64 segments with `=`
padding between them, for example:

```
AQID==BQYH==
```

The standard `atob()` rejects `=` characters in the middle of a string. We
split on padding boundaries and decode each segment individually, then
concatenate the resulting byte arrays.

Additionally, base64 must be decoded in 4-character aligned blocks. A chunk
boundary may arrive mid-block, so we track `base64Remainder` — leftover
characters that don't yet form a complete 4-char block. They're prepended to
the next chunk before decoding.

### XHR fallback inside the WebView

If the WebView `fetch` does not provide a ReadableStream, the bridge falls back
to `XMLHttpRequest` and parses `responseText` incrementally. This keeps all
streaming logic inside the WebView where text responses are delivered reliably.

If the WebView bridge is not mounted, the app falls back to the native XHR
path, which may or may not deliver incremental bytes.

---

## iOS Transport: fetch + ReadableStream

On iOS, `expo/fetch` wraps Apple's `URLSession` which delivers binary chunks
incrementally. We use the binary gRPC-Web format (`application/grpc-web+proto`)
and read from the `ReadableStream` with `getReader().read()` in a loop.

Frames may split across chunk boundaries or multiple frames may arrive in one
chunk, so the same frame buffer and `parseGrpcFrames()` function is used as
on Android.

### No ReadableStream fallback

If `expo/fetch` returns a response where `response.body.getReader` is not a
function (rare on iOS), we fall back to the XHR path. This is not expected in
normal iOS builds.

---

## Frame Parsing

`parseGrpcFrames()` is shared between both transports. It takes a cumulative
`Uint8Array` byte buffer and consumes as many complete frames as possible,
returning the number of bytes consumed.

The caller slices the buffer to discard consumed bytes:

```typescript
const consumed = parseGrpcFrames(byteBuffer, deserialize, emitter);
if (consumed > 0) {
  byteBuffer = byteBuffer.slice(consumed);
}
```

This handles:
- Multiple frames arriving in one chunk (common when catching up after reconnect)
- A frame split across two consecutive chunks (header arrives in one chunk, payload in next)
- Trailer frames signaling gRPC status code and end-of-stream

---

## The GrpcStreamLike Interface

Both transports expose the same event-emitter interface:

```typescript
interface GrpcStreamLike<T> {
  on(eventType: 'data',   callback: (message: T) => void): GrpcStreamLike<T>;
  on(eventType: 'error',  callback: (err: { code: number; message: string }) => void): GrpcStreamLike<T>;
  on(eventType: 'end',    callback: () => void): GrpcStreamLike<T>;
  on(eventType: 'status', callback: (status: {...}) => void): GrpcStreamLike<T>;
  cancel(): void;
}
```

This mirrors the grpc-web library's `ClientReadableStream` so consumers
(hooks, components) are transport-agnostic.

A key design rule: `'end'` always fires even after `cancel()`, so consumers
can reliably clean up. All other events are suppressed after cancellation.

---

## Hook lifecycle (current)

The app streams via `useFrameCache` and `useBackgroundEventCache`. These hooks:

- Start a stream on mount/focus
- Cache the last N frames/events
- Reconnect on `'end'` after 1s (simple retry loop)
- On Android dev builds, enable a polling fallback if no stream data arrives
  after a timeout (see below)

The shared stream manager exists in the repo but is not currently wired in.

---

## Dev-only polling fallback (Android)

In Android dev builds, if streaming does not yield any data after a timeout,
the hooks switch to a polling fallback based on
`getDeviceLinkMetrics()` and `getDeviceLinkMetricsTimeSeries()`.

- Polling entries are **synthetic** and tagged as `source: polling`.
- They include `rxInfo`, `object`, and `device_status` fields so the UI can
  render metrics and battery status.
- Polling is disabled as soon as real stream data arrives.

This keeps dev builds usable when the transport is blocked, while production
and preview builds continue to use true streaming.

---

## Streaming verification checklist

### Android (dev client)

1. Ensure the WebView bridge is mounted (app boot completes).
2. Start a stream (Frames/Events) and send a known uplink.
3. Confirm at least one `data` event arrives and the polling fallback stops.
4. If streaming stalls, verify WebView baseUrl matches the ChirpStack origin.

### iOS

1. Start a stream (Frames/Events) and send a known uplink.
2. Confirm `ReadableStream` yields chunks and frames arrive immediately.
3. If not, check for network/TLS issues and confirm the server emits headers.

---

## Summary: Why These Hacks Are Necessary

| Layer | Ideal | Reality on Android |
|---|---|---|
| HTTP client | Streams binary bodies incrementally | OkHttp buffers binary bodies |
| Workaround | — | Use WebView + grpc-web-text (base64) |
| Event delivery | ReadableStream yields bytes | RN fetch/XHR often stall |
| Workaround | — | WebView fetch/XHR, dev polling fallback |

None of these workarounds change the application-level behaviour: consumers
always receive the same `GrpcStreamLike<T>` interface with `'data'`, `'error'`,
`'end'`, and `'status'` events regardless of which transport is actually
running underneath.

The root cause for all Android complexity is a single OkHttp design decision:
binary response bodies are buffered. If OkHttp ever exposes incremental binary
delivery to the React Native layer, the grpc‑web‑text path can be removed in
favour of the cleaner binary `expo/fetch + ReadableStream` path.

---

## Android Debugging Checklist (Proxyman)

To verify Android streaming end‑to‑end, a proxy is invaluable:

1. Add network security config for debug builds:
   - `android/app/src/main/res/xml/network_security_config.xml`
   - `android/app/src/main/AndroidManifest.xml` → `android:networkSecurityConfig="@xml/network_security_config"`
   - `android/app/src/debug/AndroidManifest.xml` → same attribute
2. Install Proxyman CA on the Android device (user cert).
3. Set Android Wi‑Fi proxy to the Mac running Proxyman.
4. **Bypass Metro** (`192.168.1.x:8081`) in Proxyman to avoid dev‑client load errors.
5. Inspect `POST /api.InternalService/StreamDeviceFrames` and `StreamDeviceEvents`:
   - Response should stay open and emit base64 chunks.
   - Each chunk decodes to gRPC frames (data + trailers).

If the response body is empty while a manual uplink is being sent, the stream is
connected but not receiving data (device not uplinking or server not emitting).
