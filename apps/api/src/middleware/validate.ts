import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type RequestProperty = 'body' | 'query' | 'params';

/**
 * Zod validation middleware factory.
 * Validates the specified request property against the given schema.
 * On success, sets req.validated to the parsed data.
 * On failure, returns 400 with structured validation errors.
 */
export function validate(schema: ZodSchema, property: RequestProperty = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
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

function formatZodError(error: ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}
