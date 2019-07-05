/**
 * @module @dunai/server
 */

import * as http from 'http';
import WebSocket from 'ws';
import { IWebSocketClient, IWebSocketClientFactory } from './WebSocketEndpoint.interface';

export class WebSocketEndpoint extends WebSocket.Server {

    static addWebSocketListeners(socket: WebSocket, target: IWebSocketClient): void {
        socket.addListener('close', target.close);
        socket.addListener('message', target.message);
        socket.addListener('open', target.open);
        socket.addListener('ping', target.ping);
        socket.addListener('pong', target.pong);
        socket.addListener('unexpected-response', target.unexpectedResponse);
    }

    static removeWebSocketListeners(socket: WebSocket, target: IWebSocketClient): void {
        socket.removeListener('close', target.close);
        socket.removeListener('message', target.message);
        socket.removeListener('open', target.open);
        socket.removeListener('ping', target.ping);
        socket.removeListener('pong', target.pong);
        socket.removeListener('unexpected-response', target.unexpectedResponse);
    }

    constructor(clientFactory: IWebSocketClientFactory) {
        super({
            ...clientFactory.webSocketOptions,
            noServer: true
        });

        this.on('connection', (socket: WebSocket, request: http.IncomingMessage) => {
            const wrapper = (method: string, args: any[]) => clientFactory[method] ? clientFactory[method](socket, ...args) : null;

            wrapper('connection', [request]);

            socket.on('close', (...args) => wrapper('close', args));
            socket.on('message', (...args) => wrapper('message', args));
            socket.on('open', (...args) => wrapper('open', args));
            socket.on('ping', (...args) => wrapper('ping', args));
            socket.on('pong', (...args) => wrapper('pong', args));
            socket.on('unexpected-response', (...args) => wrapper('unexpected', args));
            socket.on('upgrade', (...args) => wrapper('upgrade', args));
        });

        this.on('close', data => console.log('close', data));
        this.on('error', data => console.log('error', data));
        // this.on('headers', data => console.log('headers', data));
        this.on('listening', data => console.log('listening', data));
    }
}
