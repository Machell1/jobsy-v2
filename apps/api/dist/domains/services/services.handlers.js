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
exports.listServices = listServices;
exports.getService = getService;
exports.createService = createService;
exports.updateService = updateService;
exports.deleteService = deleteService;
exports.getCategories = getCategories;
exports.getFeatured = getFeatured;
exports.getNearby = getNearby;
const servicesService = __importStar(require("./services.service"));
async function listServices(req, res, next) {
    try {
        const result = await servicesService.listServices(req.validated || req.query);
        res.json({ success: true, data: result.data, pagination: result.pagination });
    }
    catch (err) {
        next(err);
    }
}
async function getService(req, res, next) {
    try {
        const service = await servicesService.getService(req.params.id);
        res.json({ success: true, data: service });
    }
    catch (err) {
        next(err);
    }
}
async function createService(req, res, next) {
    try {
        const service = await servicesService.createService(req.user.userId, req.validated || req.body);
        res.status(201).json({ success: true, data: service });
    }
    catch (err) {
        next(err);
    }
}
async function updateService(req, res, next) {
    try {
        const service = await servicesService.updateService(req.params.id, req.user.userId, req.validated || req.body);
        res.json({ success: true, data: service });
    }
    catch (err) {
        next(err);
    }
}
async function deleteService(req, res, next) {
    try {
        await servicesService.deleteService(req.params.id, req.user.userId);
        res.json({ success: true, data: { message: 'Service deleted' } });
    }
    catch (err) {
        next(err);
    }
}
async function getCategories(_req, res, next) {
    try {
        const categories = await servicesService.getCategories();
        res.json({ success: true, data: categories });
    }
    catch (err) {
        next(err);
    }
}
async function getFeatured(req, res, next) {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 8;
        const services = await servicesService.getFeatured(limit);
        res.json({ success: true, data: services });
    }
    catch (err) {
        next(err);
    }
}
async function getNearby(req, res, next) {
    try {
        const { lat, lng, radius, limit } = req.validated || req.query;
        const services = await servicesService.getNearby(Number(lat), Number(lng), radius ? Number(radius) : 25, limit ? Number(limit) : 20);
        res.json({ success: true, data: services });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=services.handlers.js.map