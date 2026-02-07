// src/middleware/errorMiddleware.ts

import type { Request, Response, NextFunction } from "express";
import { HttpError } from "@/lib/http/errors.js";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal Server Error" });
}
