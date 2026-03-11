import posthog from 'posthog-js';

const posthogKey = process.env.POSTHOG_KEY;
const posthogHost = process.env.POSTHOG_HOST;

export function initAnalytics() {
  if (!posthogKey) return;

  posthog.init(posthogKey, {
    api_host: posthogHost ?? 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
  });
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!posthogKey) return;
  posthog.capture(eventName, properties);
}
