/**
 * @module @dunai/server
 */

export class HttpError extends Error {
    public static httpStatuses: { [code: number]: string };

    public statusCode: number;

    constructor(statusCode: number, message: string = null, public code: number = 0, public details?: object) {
        super(message);

        this.statusCode = statusCode || 500;
        this.name       = HttpError.httpStatuses[this.statusCode];

        if (!this.name)
            this.name = HttpError.httpStatuses[Math.floor(this.statusCode / 100) * 100];
    }
}

HttpError.httpStatuses = Object.freeze({
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    118: 'Connection timed out',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi-Status',
    208: 'Already Reported',
    210: 'Content Different',
    226: 'IM Used',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    306: 'Reserved',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    310: 'Too many Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Time-out',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Request Entity Too Large',
    414: 'Request-URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Requested range unsatisfiable',
    417: 'Expectation failed',
    418: 'I\'m a teapot',
    421: 'Misdirected Request',
    422: 'Unprocessable entity',
    423: 'Locked',
    424: 'Method failure',
    425: 'Unordered Collection',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    449: 'Retry With',
    450: 'Blocked by Windows Parental Controls',
    451: 'Unavailable For Legal Reasons',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway or Proxy Error',
    503: 'Service Unavailable',
    504: 'Gateway Time-out',
    505: 'HTTP Version not supported',
    507: 'Insufficient storage',
    508: 'Loop Detected',
    509: 'Bandwidth Limit Exceeded',
    510: 'Not Extended',
    511: 'Network Authentication Required'
});

Object.freeze(HttpError);

export class UnauthorizedError extends HttpError {
    constructor(message: string = 'Unauthorized', code: number = -32090, details?: object) {
        super(401, message, code, details);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message: string = 'Forbidden', code: number = -32091, details?: object) {
        super(403, message, code, details);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string = 'Not Found', code: number = -32601, details?: object) {
        super(404, message, code, details);
    }
}

export class MethodNotAllowedError extends HttpError {
    constructor(message: string = 'Method Not Allowed', code: number = -32092, details?: object) {
        super(405, message, code, details);
    }
}

export class IamaTeapotError extends HttpError {
    constructor(message: string = 'I’m a teapot', code: number = -32099, details?: object) {
        super(418, message, code, details);
    }
}

export class UnprocessableEntityError extends HttpError {
    constructor(message: string = 'Unprocessable Entity', code: number = -32600, details?: object) {
        super(422, message, code, details);
    }
}

export class LockedError extends HttpError {
    constructor(message: string = 'Locked', code: number = -32094, details?: object) {
        super(423, message, code, details);
    }
}

export class TooManyRequestsError extends HttpError {
    constructor(message: string = 'Too Many Requests', code: number = -32095, details?: object) {
        super(429, message, code, details);
    }
}

export class InternalServerError extends HttpError {
    constructor(message: string = 'Internal Server Error', code: number = -32603, details?: object) {
        super(500, message, code, details);
    }
}
