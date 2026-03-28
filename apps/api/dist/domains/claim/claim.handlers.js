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
exports.search = search;
exports.getProfile = getProfile;
exports.requestCode = requestCode;
exports.verifyCode = verifyCode;
exports.complete = complete;
exports.getStats = getStats;
exports.claimWithCode = claimWithCode;
exports.importProviders = importProviders;
const service = __importStar(require("./claim.service"));
async function search(req, res, next) {
    try {
        const q = req.query.q;
        const parish = req.query.parish;
        const category = req.query.category;
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const result = await service.searchUnclaimed({ q, parish, category, page, limit });
        res.json({ success: true, data: result.data, pagination: result.pagination });
    }
    catch (err) {
        next(err);
    }
}
async function getProfile(req, res, next) {
    try {
        const data = await service.getUnclaimedProfile(req.params.id);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function requestCode(req, res, next) {
    try {
        const { unclaimedProviderId, contactMethod = 'email', contactValue } = req.body;
        if (!unclaimedProviderId || !contactValue) {
            res.status(400).json({
                success: false,
                error: { code: 'BAD_REQUEST', message: 'unclaimedProviderId and contactValue are required' },
            });
            return;
        }
        const data = await service.requestClaimCode(unclaimedProviderId, contactMethod, contactValue);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function verifyCode(req, res, next) {
    try {
        const { unclaimedProviderId, code } = req.body;
        if (!unclaimedProviderId || !code) {
            res.status(400).json({
                success: false,
                error: { code: 'BAD_REQUEST', message: 'unclaimedProviderId and code are required' },
            });
            return;
        }
        const data = await service.verifyClaimCode(unclaimedProviderId, code);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function complete(req, res, next) {
    try {
        const { claimToken, password, name, phone } = req.body;
        if (!claimToken || !password) {
            res.status(400).json({
                success: false,
                error: { code: 'BAD_REQUEST', message: 'claimToken and password are required' },
            });
            return;
        }
        const data = await service.completeClaim({ claimToken, password, name, phone });
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function getStats(req, res, next) {
    try {
        const data = await service.getClaimStats();
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function claimWithCode(req, res, next) {
    try {
        const { code, password, name } = req.body;
        if (!code || !password) {
            res.status(400).json({
                success: false,
                error: { code: 'BAD_REQUEST', message: 'code and password are required' },
            });
            return;
        }
        const data = await service.claimWithCode(code, password, name);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
async function importProviders(req, res, next) {
    try {
        const entries = req.body;
        if (!Array.isArray(entries) || entries.length === 0) {
            res.status(400).json({
                success: false,
                error: { code: 'BAD_REQUEST', message: 'Body must be a non-empty array' },
            });
            return;
        }
        const data = await service.bulkImport(entries);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=claim.handlers.js.map