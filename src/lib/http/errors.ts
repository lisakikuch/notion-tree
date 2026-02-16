export class HttpError extends Error {
    status: number;
    details?: unknown;

    constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
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

export class ValidationError extends HttpError {
    constructor(message: string = 'Unprocessable Content', details?: unknown) {
        super(422, message, details);
    }
}