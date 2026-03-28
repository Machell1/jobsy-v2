"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.posthogClient = void 0;
exports.capture = capture;
exports.identify = identify;
exports.shutdown = shutdown;
const posthog_node_1 = require("posthog-node");
let posthogClient = null;
exports.posthogClient = posthogClient;
function getClient() {
    if (posthogClient)
        return posthogClient;
    if (!process.env.POSTHOG_API_KEY) {
        console.warn('POSTHOG_API_KEY not set — PostHog is disabled');
        return null;
    }
    exports.posthogClient = posthogClient = new posthog_node_1.PostHog(process.env.POSTHOG_API_KEY, {
        host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
    });
    return posthogClient;
}
/**
 * Capture an analytics event. No-ops gracefully when PostHog is not configured.
 */
function capture(distinctId, event, properties) {
    const client = getClient();
    if (!client)
        return;
    client.capture({ distinctId, event, properties });
}
/**
 * Identify a user with optional properties.
 */
function identify(distinctId, properties) {
    const client = getClient();
    if (!client)
        return;
    client.identify({ distinctId, properties });
}
/**
 * Flush pending events. Call during graceful shutdown.
 */
async function shutdown() {
    await posthogClient?.shutdown();
}
//# sourceMappingURL=posthog.js.map