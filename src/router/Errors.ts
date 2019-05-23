export class HttpError extends Error {
    public status     = 500;
    public statusText = 'Internal Server Error';
    constructor(public code: string | number, public message: string, public details?: object) {
        super(message);
    }
}

export class UnauthorizedError extends HttpError {
    public status     = 401;
    public statusText = 'Unauthorized';
}

export class ForbiddenError extends HttpError {
    public status     = 403;
    public statusText = 'Forbidden';
}

export class NotFoundError extends HttpError {
    public status     = 404;
    public statusText = 'Not Found';
}

export class MethodNotAllowedError extends HttpError {
    public status     = 405;
    public statusText = 'Method Not Allowed';
}

export class IamaTeapotError extends HttpError {
    public status     = 418;
    public statusText = 'I’m a teapot';
}

export class UnprocessableEntityError extends HttpError {
    public status     = 422;
    public statusText = 'Unprocessable Entity';
}

export class LockedError extends HttpError {
    public status     = 423;
    public statusText = 'Locked';
}

export class TooManyRequestsError extends HttpError {
    public status     = 429;
    public statusText = 'Too Many Requests';
}
