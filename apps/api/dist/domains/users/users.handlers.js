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
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.getPublicProfile = getPublicProfile;
exports.getUserServices = getUserServices;
exports.getUserReviews = getUserReviews;
exports.updateAvatar = updateAvatar;
exports.updateSettings = updateSettings;
exports.submitVerification = submitVerification;
exports.getDashboard = getDashboard;
const usersService = __importStar(require("./users.service"));
async function getProfile(req, res) {
    try {
        const user = await usersService.getProfile(req.user.userId);
        res.json({ success: true, data: user });
    }
    catch (error) {
        throw error;
    }
}
async function updateProfile(req, res) {
    try {
        const user = await usersService.updateProfile(req.user.userId, req.validated);
        res.json({ success: true, data: user });
    }
    catch (error) {
        throw error;
    }
}
async function getPublicProfile(req, res) {
    try {
        const user = await usersService.getPublicProfile(req.params.id);
        res.json({ success: true, data: user });
    }
    catch (error) {
        throw error;
    }
}
async function getUserServices(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await usersService.getUserServices(req.params.id, page, limit);
        res.json({ success: true, ...result });
    }
    catch (error) {
        throw error;
    }
}
async function getUserReviews(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await usersService.getUserReviews(req.params.id, page, limit);
        res.json({ success: true, ...result });
    }
    catch (error) {
        throw error;
    }
}
async function updateAvatar(req, res) {
    try {
        const { avatarUrl } = req.body;
        if (!avatarUrl) {
            res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'avatarUrl is required' },
            });
            return;
        }
        const user = await usersService.updateAvatar(req.user.userId, avatarUrl);
        res.json({ success: true, data: user });
    }
    catch (error) {
        throw error;
    }
}
async function updateSettings(req, res) {
    try {
        const user = await usersService.updateSettings(req.user.userId, req.body);
        res.json({ success: true, data: user });
    }
    catch (error) {
        throw error;
    }
}
async function submitVerification(req, res) {
    try {
        const { documents } = req.body;
        if (!documents || !Array.isArray(documents) || documents.length === 0) {
            res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'documents array is required' },
            });
            return;
        }
        const result = await usersService.submitVerification(req.user.userId, documents);
        res.status(201).json({ success: true, data: result });
    }
    catch (error) {
        throw error;
    }
}
async function getDashboard(req, res) {
    try {
        const dashboard = await usersService.getDashboard(req.user.userId, req.user.role);
        res.json({ success: true, data: dashboard });
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=users.handlers.js.map