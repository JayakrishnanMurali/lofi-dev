# Lofies

A minimal lofi music player with an animated ambient interface. Stream lofi tracks from YouTube, layer ambient sounds, and set the mood with dynamic scenes.

## Features

- **YouTube-powered** — search and stream any lofi track via the YouTube IFrame Player API
- **Ambient mixer** — layer rain, café, fireplace, waves, forest, and white noise over your music
- **Dynamic theming** — dominant colors extracted from the current track's thumbnail drive the background and visualizer
- **Scene picker** — switch between animated canvas backgrounds (snow, etc.)
- **Full playback controls** — shuffle, repeat (none / all / one), queue management, sleep timer
- **Favorites** — persisted to `localStorage`
- **Simulated visualizer** — animated bar visualizer using layered sine waves (no Web Audio API needed)

## Stack

| Layer | Tech |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Playback | YouTube IFrame Player API (hidden player, custom UI) |
| Search | YouTube Data API v3 (server-side) |
| Bundler | Bun native bundler (HTML imports, no Vite/webpack) |

## Setup

**1. Get a YouTube Data API v3 key**

Go to [Google Cloud Console](https://console.cloud.google.com), create a project, enable the YouTube Data API v3, and generate an API key.

**2. Create a `.env` file**

```
YOUTUBE_API_KEY=your_key_here
```

**3. Install dependencies and start**

```bash
bun install
bun run dev
```

The server starts at `http://localhost:3000`.

## API Routes

| Route | Description |
|---|---|
| `GET /api/popular` | Curated lofi tracks (random query, cached 10 min) |
| `GET /api/search?q=...` | YouTube search, filtered to lofi music |
| `GET /api/video/:id` | Single video details (cached 1 hour) |
| `GET /api/thumbnail/:id` | Proxied YouTube thumbnail — CORS-safe for Canvas |

## Project Structure

```
src/
  index.tsx                   # Bun server + all API routes
  lib/youtube.ts              # YouTube Data API v3 client
  store/playerStore.ts        # Zustand store (playback, queue, UI state)
  shared/types.ts             # Shared TypeScript types
  hooks/
    useYouTubePlayer.ts       # Hidden IFrame player hook
    useColorExtract.ts        # Dominant color extraction via Canvas
  components/
    Player/                   # Bottom player bar, controls, progress
    Playlist/                 # Right sidebar queue
    Search/                   # Search overlay
    AmbientMixer/             # Ambient sound layer panel
    Visualizer/               # Animated bar visualizer
    Background/               # Animated canvas orbs background
    Scenes/                   # Scene picker + lofi scene canvas
```

## Scripts

```bash
bun run dev      # Start with hot reload
bun run start    # Start in production mode
bun test         # Run tests
```
