export type PaginationParams = {
    page: number;
    limit: number;
};
export type PaginatedResult<T> = {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
};
export declare function calculatePagination(page: number, limit: number, total: number): {
    skip: number;
    take: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
};
//# sourceMappingURL=pagination.d.ts.map