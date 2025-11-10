export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly expose: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    options?: { expose?: boolean; details?: unknown }
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.expose = options?.expose ?? statusCode < 500;
    this.details = options?.details;
    Error.captureStackTrace?.(this, ApiError);
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
