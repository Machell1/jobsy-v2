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
exports.getDashboard = getDashboard;
exports.listUsers = listUsers;
exports.updateUser = updateUser;
exports.listServices = listServices;
exports.updateService = updateService;
exports.listBookings = listBookings;
exports.getPaymentReport = getPaymentReport;
exports.getReportedReviews = getReportedReviews;
exports.updateReview = updateReview;
exports.getAnalytics = getAnalytics;
const adminService = __importStar(require("./admin.service"));
async function getDashboard(_req, res, next) {
    try {
        const dashboard = await adminService.getDashboard();
        res.json({ success: true, data: dashboard });
    }
    catch (err) {
        next(err);
    }
}
async function listUsers(req, res, next) {
    try {
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const role = req.query.role;
        const search = req.query.search;
        const result = await adminService.listUsers(page, limit, role, search);
        res.json({ success: true, data: result.data, pagination: result.pagination });
    }
    catch (err) {
        next(err);
    }
}
async function updateUser(req, res, next) {
    try {
        const user = await adminService.updateUser(req.params.id, req.body);
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
}
async function listServices(req, res, next) {
    try {
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const featured = req.query.featured !== undefined
            ? req.query.featured === 'true'
            : undefined;
        const active = req.query.active !== undefined
            ? req.query.active === 'true'
            : undefined;
        const result = await adminService.listServices(page, limit, featured, active);
        res.json({ success: true, data: result.data, pagination: result.pagination });
    }
    catch (err) {
        next(err);
    }
}
async function updateService(req, res, next) {
    try {
        const service = await adminService.updateService(req.params.id, req.body);
        res.json({ success: true, data: service });
    }
    catch (err) {
        next(err);
    }
}
async function listBookings(req, res, next) {
    try {
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const status = req.query.status;
        const result = await adminService.listBookings(page, limit, status);
        res.json({ success: true, data: result.data, pagination: result.pagination });
    }
    catch (err) {
        next(err);
    }
}
async function getPaymentReport(req, res, next) {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const report = await adminService.getPaymentReport(startDate, endDate);
        res.json({ success: true, data: report });
    }
    catch (err) {
        next(err);
    }
}
async function getReportedReviews(req, res, next) {
    try {
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
        const result = await adminService.getReportedReviews(page, limit);
        res.json({ success: true, data: result.data, pagination: result.pagination });
    }
    catch (err) {
        next(err);
    }
}
async function updateReview(req, res, next) {
    try {
        const review = await adminService.updateReview(req.params.id, req.body);
        res.json({ success: true, data: review });
    }
    catch (err) {
        next(err);
    }
}
async function getAnalytics(_req, res, next) {
    try {
        const analytics = await adminService.getAnalytics();
        res.json({ success: true, data: analytics });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=admin.handlers.js.map