/**
 * Prisma 7 error helpers — avoids importing Prisma namespace directly.
 * PrismaClientKnownRequestError lives in the runtime package.
 */

export interface PrismaKnownError {
  code: string;
  message: string;
}

/**
 * Returns true if `err` is a Prisma known request error with a `code` property.
 */
export function isPrismaKnownError(err: unknown): err is PrismaKnownError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as Record<string, unknown>).code === 'string'
  );
}

/** Unique constraint violation */
export function isUniqueConstraintError(err: unknown): boolean {
  return isPrismaKnownError(err) && err.code === 'P2002';
}

/** Record not found */
export function isNotFoundError(err: unknown): boolean {
  return isPrismaKnownError(err) && err.code === 'P2025';
}
