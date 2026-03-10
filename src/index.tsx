import { serve } from 'bun';
import index from './index.html';
import { searchTracks, getPopularLofiTracks, getVideoDetails } from './lib/youtube';

const server = serve({
  routes: {
    '/*': index,

    '/api/search': {
      async GET(req) {
        const url = new URL(req.url);
        const query = url.searchParams.get('q') ?? 'lofi hip hop beats to study';

        try {
          const tracks = await searchTracks(query, 20);
          return Response.json(tracks, {
            headers: { 'Cache-Control': 'public, max-age=300' },
          });
        } catch (err) {
          console.error('Search error:', err);
          return Response.json({ error: 'Search failed' }, { status: 502 });
        }
      },
    },

    '/api/popular': {
      async GET(_req) {
        try {
          const tracks = await getPopularLofiTracks();
          return Response.json(tracks, {
            headers: { 'Cache-Control': 'public, max-age=600' },
          });
        } catch (err) {
          console.error('Popular fetch error:', err);
          return Response.json({ error: 'Failed to fetch popular tracks' }, { status: 502 });
        }
      },
    },

    '/api/video/:videoId': {
      async GET(req) {
        const { videoId } = req.params;
        try {
          const track = await getVideoDetails(videoId);
          return Response.json(track, {
            headers: { 'Cache-Control': 'public, max-age=3600' },
          });
        } catch (err) {
          console.error('Video info error:', err);
          return Response.json({ error: 'Video not found' }, { status: 404 });
        }
      },
    },

    // Thumbnail proxy — avoids CORS issues for canvas-based color extraction
    '/api/thumbnail/:videoId': {
      async GET(req) {
        const { videoId } = req.params;

        // Try maxresdefault first, fall back to hqdefault
        const thumbnailUrls = [
          `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        ];

        for (const thumbnailUrl of thumbnailUrls) {
          try {
            const response = await fetch(thumbnailUrl, {
              signal: AbortSignal.timeout(5000),
            });

            if (response.ok) {
              const buffer = await response.arrayBuffer();
              return new Response(buffer, {
                headers: {
                  'Content-Type': 'image/jpeg',
                  'Cache-Control': 'public, max-age=86400',
                  'Access-Control-Allow-Origin': '*',
                },
              });
            }
          } catch {
            continue;
          }
        }

        return new Response(null, { status: 404 });
      },
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    hmr: true,
    console: true,
  },
});

console.log(`🎵 lofi.dev running at ${server.url}`);
