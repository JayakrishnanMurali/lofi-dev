import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_IdyvfdGDHmrMt9bfQBAa8Eo2s7dDiebwATxYkedBQA3';
const POSTHOG_HOST = 'https://us.i.posthog.com';

export function initAnalytics() {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
  });
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!posthogKey) return;
  posthog.capture(eventName, properties);
}
