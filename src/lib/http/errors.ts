export class HttpError extends Error {
    status: number;
    details?: unknown;

    constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    }
}

export class BadRequestError extends HttpError {
  constructor(message: string = "Bad Request", details?: unknown) {
    super(400, message, details);
  }
}

export class UnauthorizedError extends HttpError {
    constructor(message: string = 'Unauthorized') {
        super(401, message);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message: string = 'Forbidden') {
        super(403, message);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string = 'Not Found') {
        super(404, message);
    }
}

export class ConflictError extends HttpError {
    constructor(message: string = 'Conflict') {
        super(409, message);
    }
}

export class ValidationError extends HttpError {
    constructor(message: string = 'Unprocessable Content', details?: unknown) {
        super(422, message, details);
    }
}