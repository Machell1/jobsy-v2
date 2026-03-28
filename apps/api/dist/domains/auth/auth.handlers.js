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
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.verifyEmail = verifyEmail;
exports.getMe = getMe;
const authService = __importStar(require("./auth.service"));
const REFRESH_COOKIE = 'refreshToken';
const REFRESH_EXPIRY_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRY_DAYS ?? '7', 10);
function setRefreshCookie(res, token) {
    res.cookie(REFRESH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
        path: '/',
    });
}
function clearRefreshCookie(res) {
    res.clearCookie(REFRESH_COOKIE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    });
}
async function register(req, res) {
    try {
        const result = await authService.registerUser(req.validated);
        setRefreshCookie(res, result.refreshToken);
        res.status(201).json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });
    }
    catch (error) {
        throw error;
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.validated;
        const result = await authService.loginUser(email, password);
        setRefreshCookie(res, result.refreshToken);
        res.json({
            success: true,
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });
    }
    catch (error) {
        throw error;
    }
}
async function refresh(req, res) {
    try {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        if (!refreshToken) {
            res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'No refresh token provided' },
            });
            return;
        }
        const result = await authService.refreshAccessToken(refreshToken);
        res.json({
            success: true,
            data: { accessToken: result.accessToken },
        });
    }
    catch (error) {
        throw error;
    }
}
async function logout(req, res) {
    try {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        await authService.logoutUser(req.user.userId, refreshToken);
        clearRefreshCookie(res);
        res.json({
            success: true,
            data: { message: 'Logged out successfully' },
        });
    }
    catch (error) {
        throw error;
    }
}
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        res.json({
            success: true,
            data: { message: result.message },
        });
    }
    catch (error) {
        throw error;
    }
}
async function resetPassword(req, res) {
    try {
        const { token, password } = req.body;
        const result = await authService.resetPassword(token, password);
        res.json({
            success: true,
            data: { message: result.message },
        });
    }
    catch (error) {
        throw error;
    }
}
async function verifyEmail(req, res) {
    try {
        const { userId, code } = req.body;
        const result = await authService.verifyEmail(userId, code);
        res.json({
            success: true,
            data: { message: result.message },
        });
    }
    catch (error) {
        throw error;
    }
}
async function getMe(req, res) {
    try {
        const user = await authService.getCurrentUser(req.user.userId);
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=auth.handlers.js.map