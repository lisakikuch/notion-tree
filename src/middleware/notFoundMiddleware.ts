import type { Request, Response, NextFunction } from "express";
import { NotFoundError } from "@/lib/http/errors.js";

export function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}