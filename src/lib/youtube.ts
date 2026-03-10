import type { Track } from '../shared/types';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

if (!YOUTUBE_API_KEY) {
  throw new Error('YOUTUBE_API_KEY environment variable is required');
}

function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const seconds = parseInt(match[3] ?? '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function mapYouTubeVideoToTrack(item: any): Track {
  const snippet = item.snippet ?? {};
  const contentDetails = item.contentDetails ?? {};
  const statistics = item.statistics ?? {};

  const thumbnails = snippet.thumbnails ?? {};
  const thumbnailUrl: string =
    thumbnails.maxres?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`;

  const videoId = typeof item.id === 'string' ? item.id : item.id?.videoId ?? '';

  return {
    id: videoId,
    title: snippet.title ?? 'Unknown Title',
    author: snippet.channelTitle ?? 'Unknown Artist',
    authorId: snippet.channelId ?? '',
    duration: contentDetails.duration ? parseISO8601Duration(contentDetails.duration) : 0,
    thumbnailUrl,
    viewCount: parseInt(statistics.viewCount ?? '0', 10),
    publishedText: snippet.publishedAt ? new Date(snippet.publishedAt).toLocaleDateString() : '',
  };
}

// Search videos, then batch-fetch their details (including duration)
export async function searchTracks(query: string, maxResults = 20): Promise<Track[]> {
  const searchUrl = new URL(`${BASE_URL}/search`);
  searchUrl.searchParams.set('part', 'snippet');
  // Always keep results within the lofi universe
  const lofiQuery = /\blofi\b/i.test(query) ? query : `lofi ${query}`;
  searchUrl.searchParams.set('q', lofiQuery);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('videoCategoryId', '10'); // Music category
  searchUrl.searchParams.set('maxResults', String(maxResults));
  searchUrl.searchParams.set('relevanceLanguage', 'en');
  searchUrl.searchParams.set('key', YOUTUBE_API_KEY!);

  const searchResponse = await fetch(searchUrl.toString());
  if (!searchResponse.ok) {
    throw new Error(`YouTube search failed: ${searchResponse.status}`);
  }
  const searchData = await searchResponse.json() as any;

  const videoIds: string[] = (searchData.items ?? [])
    .map((item: any) => item.id?.videoId)
    .filter(Boolean);

  if (videoIds.length === 0) return [];

  // Batch fetch video details for duration + statistics
  const detailsUrl = new URL(`${BASE_URL}/videos`);
  detailsUrl.searchParams.set('part', 'snippet,contentDetails,statistics');
  detailsUrl.searchParams.set('id', videoIds.join(','));
  detailsUrl.searchParams.set('key', YOUTUBE_API_KEY!);

  const detailsResponse = await fetch(detailsUrl.toString());
  if (!detailsResponse.ok) {
    throw new Error(`YouTube video details failed: ${detailsResponse.status}`);
  }
  const detailsData = await detailsResponse.json() as any;

  return (detailsData.items ?? [])
    .filter((item: any) => {
      const duration = parseISO8601Duration(item.contentDetails?.duration ?? '');
      return duration > 60; // Filter out very short clips
    })
    .map(mapYouTubeVideoToTrack);
}

export async function getVideoDetails(videoId: string): Promise<Track> {
  const url = new URL(`${BASE_URL}/videos`);
  url.searchParams.set('part', 'snippet,contentDetails,statistics');
  url.searchParams.set('id', videoId);
  url.searchParams.set('key', YOUTUBE_API_KEY!);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`YouTube video fetch failed: ${response.status}`);

  const data = await response.json() as any;
  const item = data.items?.[0];
  if (!item) throw new Error(`Video ${videoId} not found`);

  return mapYouTubeVideoToTrack(item);
}

// Popular lofi search queries rotated for variety
const LOFI_QUERIES = [
  'lofi hip hop beats to study relax',
  'lofi chill beats study music',
  'lofi hip hop radio beats to sleep',
  'chillhop music beats to relax',
  'lofi jazz coffee shop music',
];

export async function getPopularLofiTracks(): Promise<Track[]> {
  const randomQuery = LOFI_QUERIES[Math.floor(Math.random() * LOFI_QUERIES.length)]!;
  return searchTracks(randomQuery, 25);
}
