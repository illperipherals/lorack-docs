---
draft: true
sidebar_position: 3
title: "Frame & Event Persistence"
description: "How frames and events are cached and restored across navigation"
---

# Frame and Event Persistence Fix

## Issue
Frames and events would disappear when navigating away from the device detail screen and returning. The tabs would always start with empty lists, even though frames/events had been previously loaded.

## Root Cause
The `DeviceFramesTab` and `DeviceEventsTab` components were:
1. Starting with empty state arrays (`useState<FrameLogItem[]>([])`)
2. Only populating frames/events from streaming
3. Not checking or loading from the cache on mount

While the background hooks (`useFrameCache`, `useBackgroundEventCache`) were caching data, and the tabs were writing to the cache, they weren't reading from it on initialization.

## Solution

### DeviceFramesTab Changes
**File**: `src/components/device-tabs/DeviceFramesTab.tsx`

Added cache loading in the `useEffect` hook before starting streaming:

```typescript
useEffect(() => {
  // ... initialization code ...
  
  // Load cached frames first
  const cachedFrames = frameCache.getFrames(devEui);
  if (cachedFrames.length > 0) {
    console.log(`[DeviceFramesTab] Loading ${cachedFrames.length} cached frames`);
    setFrames(cachedFrames.slice(0, 100));
    // Track cached frame IDs to avoid duplicates
    cachedFrames.forEach(frame => {
      const frameId = `${frame.time.getTime()}`;
      lastFrameIdsRef.current.add(frameId);
    });
    frameCounter.current = cachedFrames.length;
  }
  
  startStreaming();
  // ...
}, [devEui]);
```

### DeviceEventsTab Changes
**File**: `src/components/device-tabs/DeviceEventsTab.tsx`

Added similar cache loading for events:

```typescript
useEffect(() => {
  // ... initialization code ...
  
  // Load cached events first
  const cachedEvents = eventCache.getEvents(devEui);
  if (cachedEvents.length > 0) {
    console.log(`[DeviceEventsTab] Loading ${cachedEvents.length} cached events`);
    const eventItems: EventLogItem[] = cachedEvents.map(e => ({
      id: e.id,
      time: e.time,
      description: '',
      body: e.body,
      properties: {},
    }));
    setEvents(eventItems.slice(0, 100));
    // Track cached event IDs to avoid duplicates
    cachedEvents.forEach(event => {
      lastEventIdsRef.current.add(event.id);
    });
    eventCounter.current = cachedEvents.length;
  }
  
  startStreaming();
  // ...
}, [devEui]);
```

## How It Works

### Data Flow

1. **Initial Load** (First visit to device):
   - Tab loads with empty cache
   - Streaming starts immediately
   - Frames/events arrive and are:
     - Displayed in the UI
     - Cached in `frameCache`/`eventCache`

2. **Navigation Away**:
   - Component unmounts
   - Streaming stops and cleanup occurs
   - Component state is cleared
   - **BUT**: Cache persists in memory

3. **Return to Device** (Navigate back):
   - Tab mounts again
   - **NEW**: Immediately loads from cache
   - **Result**: Previous frames/events visible instantly
   - Streaming starts to get any new data
   - New frames/events are merged (duplicates avoided)

### Cache Management

Both caches use in-memory storage with:
- **Max Frames**: 1000 per device (100 displayed)
- **Max Events**: 100 per device
- **TTL**: 1 hour (data expires after this)
- **Deduplication**: Frame/event IDs tracked to avoid showing duplicates

### Benefits

1. **Instant Data**: Historical frames/events appear immediately on return
2. **Better UX**: No need to wait for streaming to reload history
3. **Network Efficient**: Reuses cached data instead of re-fetching
4. **Seamless Merging**: New frames/events merge with cached ones
5. **No Duplicates**: ID tracking prevents showing the same data twice

## Testing

### Verify the Fix

1. **Navigate to Device**:
   ```
   Home → Applications → Device Detail → More Tab → Frames
   ```

2. **Wait for Frames to Load**:
   - You should see frames appearing
   - Check logs: `[DeviceFramesTab] ✅ Received HISTORICAL frame`

3. **Navigate Away**:
   - Go back to home screen
   - Or navigate to another device

4. **Return to Same Device**:
   - Go back to the device
   - Go to More Tab → Frames
   - **Expected**: Frames appear immediately (not after delay)
   - Check logs: `[DeviceFramesTab] Loading X cached frames`

5. **Repeat for Events**:
   - More Tab → Events
   - Navigate away and back
   - Events should persist

### Expected Log Output

On first visit (no cache):
```
[DeviceFramesTab] Starting background frame stream for a84041d941832b31
[DeviceFramesTab] ✅ Received HISTORICAL frame
[DeviceFramesTab] ✅ Received HISTORICAL frame
...
```

On return visit (with cache):
```
[DeviceFramesTab] Loading 50 cached frames
[DeviceFramesTab] Starting background frame stream for a84041d941832b31
[DeviceFramesTab] 🔴 NEW LIVE FRAME: ... (only new ones)
```

## Cache Behavior

### Cache Expiration
Cached data expires after 1 hour. After expiration:
- Cache returns empty array
- Full history is re-streamed
- Cache is repopulated

### Cache Limits
- **Frames**: Up to 1000 stored, 100 displayed
- **Events**: Up to 100 stored, 100 displayed
- Oldest items are dropped when limits exceeded

### Cache Clearing
Cache can be cleared:
- **Per Device**: `frameCache.clear(devEui)` or `eventCache.clear(devEui)`
- **All Devices**: `frameCache.clearAll()` or `eventCache.clearAll()`
- **Automatic**: On app restart (in-memory storage)

## Related Components

### Background Caching Hooks
- `useFrameCache`: Streams frames in background while on device screen
- `useBackgroundEventCache`: Streams events in background for telemetry

These hooks feed the caches that the tabs now read from on mount.

### Cache Services
- `src/services/frame-cache.ts`: Singleton frame cache
- `src/services/event-cache.ts`: Singleton event cache

Both provide:
- `addFrame(devEui, frame)` / `addEvent(devEui, event)`
- `getFrames(devEui)` / `getEvents(devEui)`
- `clear(devEui)` / `clearAll()`

## Future Enhancements

1. **Persistent Storage**: 
   - Use AsyncStorage to persist cache across app restarts
   - Would require serialization/deserialization

2. **Cache Indicators**:
   - Show "cached" vs "live" indicators on frames
   - Display cache age/freshness

3. **Smart Refresh**:
   - Only stream frames newer than cached ones
   - Reduce redundant data transfer

4. **Cache Statistics**:
   - Expose cache hit rates
   - Show cache size in settings

5. **Per-Profile Caching**:
   - Separate caches per ChirpStack profile
   - Useful when switching between servers

## Troubleshooting

### Frames Still Disappearing

1. **Check Cache TTL**:
   - If more than 1 hour passes, cache expires
   - Normal behavior, not a bug

2. **Check Logs**:
   ```
   [DeviceFramesTab] Loading X cached frames
   ```
   - If this doesn't appear, cache isn't populated
   - Verify streaming is working first

3. **Memory Issues**:
   - On low-memory devices, caches might be cleared
   - Consider reducing MAX_FRAMES_PER_DEVICE

### Events Not Persisting

Events cache is smaller (100 vs 1000) and may fill up faster:
- Check if device is very active
- Consider increasing MAX_EVENTS_PER_DEVICE
- Events are primarily for telemetry, not display

## Performance Notes

- **Memory Usage**: ~100KB per device (1000 frames × ~100 bytes each)
- **Lookup Time**: O(1) - Map-based storage
- **Merge Time**: O(n) where n = new frames to add
- **Display Time**: Instant (data already in component state)

The caching approach is memory-efficient and provides excellent UX.
