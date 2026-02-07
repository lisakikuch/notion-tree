// src/lib/http/errors.ts

export class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
    super(message);
    this.status = status;
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