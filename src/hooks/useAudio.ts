// Re-exports the YouTube player hook under the useAudio name so all
// existing call-sites (App, Player, etc.) continue to work unchanged.
export { useYouTubePlayer as useAudio } from './useYouTubePlayer';
