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
exports.getToken = getToken;
exports.createChannel = createChannel;
exports.listChannels = listChannels;
const service = __importStar(require("./chat.service"));
async function getToken(req, res, next) {
    try {
        const token = service.generateToken(req.user.userId);
        res.json({
            success: true,
            data: { token, userId: req.user.userId },
        });
    }
    catch (err) {
        next(err);
    }
}
async function createChannel(req, res, next) {
    try {
        const { userId, serviceId } = req.validated;
        const channel = await service.createOrGetChannel(req.user.userId, userId, serviceId);
        res.status(201).json({ success: true, data: channel });
    }
    catch (err) {
        next(err);
    }
}
async function listChannels(req, res, next) {
    try {
        const channels = await service.listChannels(req.user.userId);
        res.json({ success: true, data: channels });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=chat.handlers.js.map