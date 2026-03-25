"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePagination = calculatePagination;
function calculatePagination(page, limit, total) {
    const pages = Math.ceil(total / limit) || 1;
    const safePage = Math.max(1, Math.min(page, pages));
    return {
        skip: (safePage - 1) * limit,
        take: limit,
        pagination: {
            page: safePage,
            limit,
            total,
            pages,
        },
    };
}
//# sourceMappingURL=pagination.js.map