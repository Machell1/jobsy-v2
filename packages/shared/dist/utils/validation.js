"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidJamaicanPhone = isValidJamaicanPhone;
exports.isValidParish = isValidParish;
exports.sanitizeString = sanitizeString;
const jamaica_parishes_1 = require("../constants/jamaica-parishes");
/**
 * Validates Jamaican phone numbers.
 * Accepts formats: +1876XXXXXXX, 1876XXXXXXX, 876XXXXXXX, XXXXXXX
 */
function isValidJamaicanPhone(phone) {
    const cleaned = phone.replace(/[\s\-().]/g, "");
    return /^(\+?1)?876\d{7}$/.test(cleaned) || /^\d{7}$/.test(cleaned);
}
function isValidParish(parish) {
    return jamaica_parishes_1.JAMAICA_PARISHES.includes(parish);
}
/**
 * Trims whitespace and removes characters commonly used in XSS attacks.
 */
function sanitizeString(str) {
    return str
        .trim()
        .replace(/[<>]/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+=/gi, "");
}
//# sourceMappingURL=validation.js.map