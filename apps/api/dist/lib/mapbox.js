"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodingClient = void 0;
exports.geocodeAddress = geocodeAddress;
exports.reverseGeocode = reverseGeocode;
// @mapbox/mapbox-sdk doesn't ship reliable TS types — use require pattern.
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAPBOX_ACCESS_TOKEN,
});
exports.geocodingClient = geocodingClient;
/**
 * Forward-geocode an address string into coordinates.
 */
async function geocodeAddress(address) {
    const response = await geocodingClient
        .forwardGeocode({ query: address, limit: 1 })
        .send();
    const feature = response.body.features?.[0];
    if (!feature)
        return null;
    const [longitude, latitude] = feature.center;
    return { latitude, longitude, placeName: feature.place_name };
}
/**
 * Reverse-geocode coordinates into a place name.
 */
async function reverseGeocode(latitude, longitude) {
    const response = await geocodingClient
        .reverseGeocode({ query: [longitude, latitude], limit: 1 })
        .send();
    return response.body.features?.[0]?.place_name ?? null;
}
//# sourceMappingURL=mapbox.js.map