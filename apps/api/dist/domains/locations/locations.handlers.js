"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocode = geocode;
exports.reverseGeocode = reverseGeocode;
exports.listParishes = listParishes;
exports.autocomplete = autocomplete;
const locationsService = __importStar(require("./locations.service"));
const error_handler_1 = require("../../middleware/error-handler");
async function geocode(req, res, next) {
    try {
        const address = req.query.address;
        if (!address) {
            throw new error_handler_1.AppError('MISSING_PARAM', 400, 'Address query parameter is required');
        }
        const results = await locationsService.forwardGeocode(address);
        res.json({ success: true, data: results });
    }
    catch (err) {
        next(err);
    }
}
async function reverseGeocode(req, res, next) {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        if (isNaN(lat) || isNaN(lng)) {
            throw new error_handler_1.AppError('MISSING_PARAM', 400, 'Valid lat and lng query parameters are required');
        }
        const result = await locationsService.reverseGeocode(lat, lng);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function listParishes(_req, res, next) {
    try {
        const parishes = locationsService.getParishes();
        res.json({ success: true, data: parishes });
    }
    catch (err) {
        next(err);
    }
}
async function autocomplete(req, res, next) {
    try {
        const query = req.query.q;
        if (!query) {
            throw new error_handler_1.AppError('MISSING_PARAM', 400, 'Query parameter q is required');
        }
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
        const results = await locationsService.autocomplete(query, limit);
        res.json({ success: true, data: results });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=locations.handlers.js.map