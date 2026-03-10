import { useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import type { DominantColors } from '../shared/types';

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;

  const maxChannel = Math.max(normalizedR, normalizedG, normalizedB);
  const minChannel = Math.min(normalizedR, normalizedG, normalizedB);
  const lightness = (maxChannel + minChannel) / 2;

  if (maxChannel === minChannel) return [0, 0, lightness];

  const delta = maxChannel - minChannel;
  const saturation = lightness > 0.5 ? delta / (2 - maxChannel - minChannel) : delta / (maxChannel + minChannel);

  let hue = 0;
  if (maxChannel === normalizedR) hue = ((normalizedG - normalizedB) / delta + (normalizedG < normalizedB ? 6 : 0)) / 6;
  else if (maxChannel === normalizedG) hue = ((normalizedB - normalizedR) / delta + 2) / 6;
  else hue = ((normalizedR - normalizedG) / delta + 4) / 6;

  return [hue * 360, saturation, lightness];
}

function colorToRgba(r: number, g: number, b: number, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Simple dominant color extraction via pixel sampling
function extractDominantColors(imageData: ImageData): [[number, number, number], [number, number, number], [number, number, number]] {
  const data = imageData.data;
  const sampleStep = Math.max(4, Math.floor(data.length / 4 / 200)) * 4; // ~200 samples

  const colorBuckets: Map<string, { r: number; g: number; b: number; count: number }> = new Map();

  for (let i = 0; i < data.length; i += sampleStep) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];

    if (alpha < 128) continue;

    // Skip near-white, near-black, and near-grey pixels for more interesting palette
    const [, saturation, lightness] = rgbToHsl(r, g, b);
    if (lightness < 0.08 || lightness > 0.92 || saturation < 0.1) continue;

    // Quantize to buckets of 32
    const quantR = Math.floor(r / 32) * 32;
    const quantG = Math.floor(g / 32) * 32;
    const quantB = Math.floor(b / 32) * 32;
    const key = `${quantR},${quantG},${quantB}`;

    const existing = colorBuckets.get(key);
    if (existing) {
      existing.count++;
      existing.r = (existing.r + r) / 2;
      existing.g = (existing.g + g) / 2;
      existing.b = (existing.b + b) / 2;
    } else {
      colorBuckets.set(key, { r, g, b, count: 1 });
    }
  }

  const sortedColors = Array.from(colorBuckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Ensure we have at least 3 colors, pad with defaults if needed
  const fallbacks: [number, number, number][] = [
    [139, 92, 246], // purple
    [219, 39, 119], // pink
    [14, 165, 233], // sky
  ];

  const extractedTriple: [number, number, number][] = sortedColors
    .slice(0, 3)
    .map((c) => [c.r, c.g, c.b] as [number, number, number]);

  while (extractedTriple.length < 3) {
    extractedTriple.push(fallbacks[extractedTriple.length]);
  }

  return [extractedTriple[0], extractedTriple[1], extractedTriple[2]];
}

export function useColorExtract() {
  const setDominantColors = usePlayerStore((state) => state.setDominantColors);

  const extractColors = useCallback(async (thumbnailUrl: string) => {
    try {
      // Use our proxied thumbnail endpoint to avoid CORS issues
      const videoIdMatch = thumbnailUrl.match(/vi\/([^/]+)\//);
      const proxyUrl = videoIdMatch
        ? `/api/thumbnail/${videoIdMatch[1]}`
        : thumbnailUrl;

      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = objectUrl;
      });

      const canvas = document.createElement('canvas');
      const scaledWidth = Math.min(img.width, 100);
      const scaledHeight = Math.floor((scaledWidth / img.width) * img.height);
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas context');
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

      const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
      const [primary, secondary, tertiary] = extractDominantColors(imageData);

      URL.revokeObjectURL(objectUrl);

      const dominantColors: DominantColors = {
        primary: colorToRgba(primary[0], primary[1], primary[2], 0.65),
        secondary: colorToRgba(secondary[0], secondary[1], secondary[2], 0.45),
        tertiary: colorToRgba(tertiary[0], tertiary[1], tertiary[2], 0.35),
      };

      setDominantColors(dominantColors);

      // Update CSS custom properties for smooth global transition
      document.documentElement.style.setProperty('--accent-primary', dominantColors.primary);
      document.documentElement.style.setProperty('--accent-secondary', dominantColors.secondary);
      document.documentElement.style.setProperty('--accent-tertiary', dominantColors.tertiary);

      // Raw RGB for further use
      document.documentElement.style.setProperty('--accent-primary-raw', `${primary[0]}, ${primary[1]}, ${primary[2]}`);
    } catch (err) {
      console.warn('Color extraction failed:', err);
    }
  }, [setDominantColors]);

  return { extractColors };
}
