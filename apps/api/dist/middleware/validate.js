"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
/**
 * Zod validation middleware factory.
 * Validates the specified request property against the given schema.
 * On success, sets req.validated to the parsed data.
 * On failure, returns 400 with structured validation errors.
 */
function validate(schema, property = 'body') {
    return (req, res, next) => {
        const result = schema.safeParse(req[property]);
        if (!result.success) {
            const formatted = formatZodError(result.error);
            res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Request validation failed',
                    details: formatted,
                },
            });
            return;
        }
        req.validated = result.data;
        next();
    };
}
function formatZodError(error) {
    return error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
    }));
}
//# sourceMappingURL=validate.js.map