import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https:

let isInitialized = false;

export const initAnalytics = () => {
  if (POSTHOG_KEY && !isInitialized) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: true, 
      capture_pageview: true,
      persistence: 'localStorage'
    });
    isInitialized = true;
  } else if (!POSTHOG_KEY) {
    console.warn("PostHog Key missing. Analytics disabled.");
  }
};

export const trackEvent = (eventName, properties = {}) => {
  if (POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }
};

export const identifyUser = (userId, traits = {}) => {
  if (POSTHOG_KEY) {
    posthog.identify(userId, traits);
  }
};

export const resetAnalytics = () => {
  if (POSTHOG_KEY) {
    posthog.reset();
  }
};
