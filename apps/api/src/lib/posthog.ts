import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

function getClient(): PostHog | null {
  if (posthogClient) return posthogClient;

  if (!process.env.POSTHOG_API_KEY) {
    console.warn('POSTHOG_API_KEY not set — PostHog is disabled');
    return null;
  }

  posthogClient = new PostHog(process.env.POSTHOG_API_KEY, {
    host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
  });

  return posthogClient;
}

/**
 * Capture an analytics event. No-ops gracefully when PostHog is not configured.
 */
export function capture(
  distinctId: string,
  event: string,
  properties?: Record<string, any>,
): void {
  const client = getClient();
  if (!client) return;

  client.capture({ distinctId, event, properties });
}

/**
 * Identify a user with optional properties.
 */
export function identify(
  distinctId: string,
  properties?: Record<string, any>,
): void {
  const client = getClient();
  if (!client) return;

  client.identify({ distinctId, properties });
}

/**
 * Flush pending events. Call during graceful shutdown.
 */
export async function shutdown(): Promise<void> {
  await posthogClient?.shutdown();
}

export { posthogClient };
