const EVENTS_KEY = "trnc:events";
const MAX_EVENTS = 500;

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

/** Send custom event to Plausible (if loaded) */
function sendToPlausible(event: string, properties: Record<string, unknown>): void {
  // Plausible injects window.plausible when loaded
  const w = window as unknown as {
    plausible?: (event: string, opts?: { props: Record<string, unknown> }) => void;
  };
  if (typeof w.plausible === "function") {
    // Plausible props must be flat string/number/boolean values
    const props: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(properties)) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        props[key] = value;
      } else if (value != null) {
        props[key] = String(value);
      }
    }
    w.plausible(event, { props });
  }
}

/**
 * Track an analytics event.
 * Events are sent to Plausible (if configured) and stored in localStorage.
 */
export function track(event: string, properties: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  const entry: AnalyticsEvent = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] ${event}`, properties);
  }

  // Forward to Plausible
  sendToPlausible(event, properties);

  // Store locally
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    events.push(entry);
    if (events.length > MAX_EVENTS) {
      events.splice(0, events.length - MAX_EVENTS);
    }
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch {
    // Storage full or unavailable
  }
}

/** Get all stored events (for debugging) */
export function getEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
