import * as http from 'http';
import WebSocket from 'ws';

export interface IWebSocketClientFactory {
    webSocketOptions?: WebSocket.ServerOptions;
    verifyClient?(
        info: {
            origin: string;
            secure: boolean;
            req: http.IncomingMessage
        }
    ): Promise<{
        res: boolean,
        code?: number,
        message?: string,
        headers?: http.OutgoingHttpHeaders
    }>;

    connection?(socket: WebSocket, request?: http.IncomingMessage): void;
    open?(socket: WebSocket): void;
    message?(socket: WebSocket, data: WebSocket.Data): void;
    close?(socket: WebSocket, code: number, reason: string): void;
    ping?(socket: WebSocket, data: Buffer): void;
    pong?(socket: WebSocket, data: Buffer): void;
    unexpectedResponse?(socket: WebSocket, request: http.ClientRequest, response: http.IncomingMessage): void;

    error?(socket: WebSocket, error: Error): void;

    serverError?(error: Error): void;
}

export interface IWebSocketClient {
    connection?(request?: http.IncomingMessage): void;
    open?(): void;
    message?(data: WebSocket.Data): void;
    close?(code: number, reason: string): void;
    ping?(data: Buffer): void;
    pong?(data: Buffer): void;
    unexpectedResponse?(request: http.ClientRequest, response: http.IncomingMessage): void;

    error?(error: Error): void;
}
