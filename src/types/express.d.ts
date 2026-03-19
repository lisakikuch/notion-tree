import "express";

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string };

      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export { };