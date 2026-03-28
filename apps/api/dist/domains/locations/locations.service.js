"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardGeocode = forwardGeocode;
exports.reverseGeocode = reverseGeocode;
exports.getParishes = getParishes;
exports.autocomplete = autocomplete;
const mapbox_1 = require("../../lib/mapbox");
const shared_1 = require("@jobsy/shared");
async function forwardGeocode(address) {
    try {
        const response = await mapbox_1.geocodingClient
            .forwardGeocode({
            query: address,
            countries: ['JM'],
            limit: 5,
        })
            .send();
        const features = response.body.features || [];
        return features.map((feature) => ({
            placeName: feature.place_name,
            coordinates: feature.center,
            relevance: feature.relevance,
        }));
    }
    catch (error) {
        console.error('Forward geocode error:', error);
        return [];
    }
}
async function reverseGeocode(lat, lng) {
    try {
        const response = await mapbox_1.geocodingClient
            .reverseGeocode({
            query: [lng, lat],
            limit: 1,
        })
            .send();
        const feature = response.body.features?.[0];
        if (!feature)
            return null;
        return {
            placeName: feature.place_name,
            coordinates: feature.center,
        };
    }
    catch (error) {
        console.error('Reverse geocode error:', error);
        return null;
    }
}
function getParishes() {
    return shared_1.JAMAICA_PARISHES;
}
async function autocomplete(query, limit = 5) {
    try {
        const response = await mapbox_1.geocodingClient
            .forwardGeocode({
            query,
            countries: ['JM'],
            autocomplete: true,
            limit,
        })
            .send();
        const features = response.body.features || [];
        return features.map((feature) => ({
            placeName: feature.place_name,
            coordinates: feature.center,
            relevance: feature.relevance,
        }));
    }
    catch (error) {
        console.error('Autocomplete error:', error);
        return [];
    }
}
//# sourceMappingURL=locations.service.js.map