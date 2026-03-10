export interface Track {
  id: string;
  title: string;
  author: string;
  authorId: string;
  duration: number; // seconds
  thumbnailUrl: string;
  viewCount: number;
  publishedText: string;
}

export interface AudioFormat {
  itag: number;
  mimeType: string;
  bitrate: number;
  audioQuality: string;
}

export interface StreamInfo {
  streamUrl: string;
  mimeType: string;
  itag: number;
}

export type RepeatMode = 'none' | 'one' | 'all';
export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface AmbientLayer {
  id: string;
  name: string;
  emoji: string;
  audioPath: string;
  volume: number;
  active: boolean;
}

export interface DominantColors {
  primary: string;
  secondary: string;
  tertiary: string;
}
