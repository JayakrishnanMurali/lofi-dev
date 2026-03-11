import type { Track, StreamInfo } from '../shared/types';

const INVIDIOUS_INSTANCES = [
  'https://inv.riverside.rocks',
  'https://yt.artemislena.eu',
  'https://invidious.sethforprivacy.com',
  'https://invidious.tiekoetter.com',
  'https://iv.melmac.space',
];

// Prefer opus (251), then m4a (140), then lower quality
const PREFERRED_AUDIO_ITAGS = [251, 250, 249, 140, 139];

let currentInstanceIndex = 0;

async function fetchFromInvidious(path: string): Promise<Response> {
  let lastError: Error = new Error('No instances available');

  for (let attempt = 0; attempt < INVIDIOUS_INSTANCES.length; attempt++) {
    const instanceIndex = (currentInstanceIndex + attempt) % INVIDIOUS_INSTANCES.length;
    const baseUrl = INVIDIOUS_INSTANCES[instanceIndex];

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'Lofies/1.0' },
      });

      if (response.ok) {
        currentInstanceIndex = instanceIndex;
        return response;
      }

      lastError = new Error(`HTTP ${response.status} from ${baseUrl}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError;
}

export function getCurrentInstance(): string {
  return INVIDIOUS_INSTANCES[currentInstanceIndex];
}

export async function searchTracks(query: string, page = 1): Promise<Track[]> {
  const params = new URLSearchParams({
    q: query,
    type: 'video',
    sort_by: 'relevance',
    page: String(page),
  });

  const response = await fetchFromInvidious(`/api/v1/search?${params}`);
  const results = await response.json() as any[];

  return results
    .filter((item: any) => item.type === 'video' && item.lengthSeconds > 30)
    .map(mapInvidiousVideoToTrack);
}

export async function getVideoInfo(videoId: string): Promise<Track> {
  const response = await fetchFromInvidious(`/api/v1/videos/${videoId}`);
  const data = await response.json() as any;
  return mapInvidiousVideoToTrack(data);
}

export async function getStreamInfo(videoId: string): Promise<StreamInfo> {
  const response = await fetchFromInvidious(`/api/v1/videos/${videoId}`);
  const data = await response.json() as any;

  const adaptiveFormats: any[] = data.adaptiveFormats ?? [];
  const audioFormats = adaptiveFormats.filter((f: any) =>
    f.type?.startsWith('audio/') || f.mimeType?.startsWith('audio/')
  );

  // Pick the best audio format by preferred itag order
  let selectedFormat: any = null;
  for (const preferredItag of PREFERRED_AUDIO_ITAGS) {
    const found = audioFormats.find((f: any) => f.itag === preferredItag);
    if (found) {
      selectedFormat = found;
      break;
    }
  }

  if (!selectedFormat && audioFormats.length > 0) {
    selectedFormat = audioFormats.sort((a: any, b: any) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
  }

  if (!selectedFormat) {
    throw new Error(`No audio format found for ${videoId}`);
  }

  const instance = getCurrentInstance();
  const mimeType = selectedFormat.type ?? selectedFormat.mimeType ?? 'audio/webm';

  // Use Invidious latest_version endpoint — it proxies the stream with CORS headers
  const streamUrl = `${instance}/latest_version?id=${videoId}&itag=${selectedFormat.itag}&local=true`;

  return {
    streamUrl,
    mimeType: mimeType.split(';')[0].trim(),
    itag: selectedFormat.itag,
  };
}

function mapInvidiousVideoToTrack(data: any): Track {
  const thumbnail =
    data.videoThumbnails?.find((t: any) => t.quality === 'maxresdefault') ??
    data.videoThumbnails?.find((t: any) => t.quality === 'hqdefault') ??
    data.videoThumbnails?.[0];

  const thumbnailUrl: string = thumbnail?.url
    ? String(thumbnail.url)
    : `https://img.youtube.com/vi/${data.videoId}/hqdefault.jpg`;

  return {
    id: data.videoId,
    title: data.title,
    author: data.author,
    authorId: data.authorId ?? '',
    duration: data.lengthSeconds ?? 0,
    thumbnailUrl,
    viewCount: data.viewCount ?? 0,
    publishedText: data.publishedText ?? '',
  };
}
