import { Injector, Service } from '@dunai/core';
import { IncomingMessage } from 'http';
import { describe, it } from 'mocha';
import should from 'should';
import url from 'url';
import WebSocket from 'ws';
import { Application, createApp } from '../Application';
import { Controller } from '../controller/Controller';
import { HttpServer } from '../HttpServer';
import { Route } from '../router/Router';
import { fetch, sleep } from '../utils.spec';
import { IWebSocketClientFactory } from './WebSocketEndpoint.interface';

@Service()
class HelloWebSocket implements IWebSocketClientFactory {
    public connection(socket: WebSocket, request?: IncomingMessage): void {
        socket.send('hello');
    }

    public message(socket: WebSocket, data: string | Buffer | ArrayBuffer | Buffer[]): void {
        socket.send('hi');
    }
}

@Service()
class WelcomeWebSocket implements IWebSocketClientFactory {
    public connection(socket: WebSocket, request?: IncomingMessage): void {
        socket.send('welcome');
    }

    public message(socket: WebSocket, data: string | Buffer | ArrayBuffer | Buffer[]): void {
        socket.send('awesome');
    }
}

@Application()
class App {
    public hello = new HelloWebSocket();
    public welcome = new WelcomeWebSocket();

    constructor(public server?: HttpServer) {}

    public init(): void {
        this.server.registerController('/ping', DefaultController);
        this.server.webSocket(this.hello);
        this.server.webSocket('/ws', this.welcome);
    }
}

@Controller('Ping controller')
class DefaultController {
    @Route('get', '/')
    public index(req: any) {
        const urlInfo = url.parse(req.originalUrl);

        return {
            ping: 'ok'
        };
    }
}

let app: App;

describe('WebSocket', () => {
    beforeEach(() => {
        Injector.reset();
    });

    afterEach(() => app.server.close());

    it('base root test', async () => {
        app = createApp(App);
        app.init();
        await app.server.listen(3000);

        const socket = new WebSocket('ws://127.0.0.1:3000');

        const messages: any[] = [];

        socket.onopen = () => {
            // console.log('Соединение установлено.');
        };

        socket.onclose = event => {
            if (event.wasClean) {
                // console.log('Соединение закрыто чисто');
            } else {
                // console.log('Обрыв соединения'); // например, "убит" процесс сервера
            }
            // console.log('Код: ' + event.code + ' причина: ' + event.reason);
        };

        socket.onmessage = event => {
            // console.log('Получены данные ' + event.data);
            messages.push(event.data);
        };

        socket.onerror = error => {
            // console.log('Ошибка ' + error.message);
            throw error;
        };

        await sleep(100);
        should(messages[0]).eql('hello');
        socket.send('Привет');
        await sleep(100);
        should(messages[1]).eql('hi');

        socket.ping();
        await sleep(100);
        socket.pong();
        await sleep(100);
        socket.close();
    });

    it('base path test', async () => {
        app = createApp(App);
        app.init();
        await app.server.listen(3000);

        const socket = new WebSocket('ws://127.0.0.1:3000/ws');

        const messages: any[] = [];

        socket.onopen = () => {
            // console.log('Соединение установлено.');
        };

        socket.onclose = event => {
            if (event.wasClean) {
                // console.log('Соединение закрыто чисто');
            } else {
                // console.log('Обрыв соединения'); // например, "убит" процесс сервера
            }
            // console.log('Код: ' + event.code + ' причина: ' + event.reason);
        };

        socket.onmessage = event => {
            // console.log('Получены данные ' + event.data);
            messages.push(event.data);
        };

        socket.onerror = error => {
            // console.log('Ошибка ' + error.message);
            throw error;
        };

        await sleep(100);
        should(messages[0]).eql('welcome');
        socket.send('nice');
        await sleep(100);
        should(messages[1]).eql('awesome');

        socket.ping();
        await sleep(100);
        socket.pong();
        await sleep(100);
        socket.close();
    });

    it('base path test (not found)', async () => {
        app = createApp(App);
        app.init();
        app.server.listen(3000);

        await (new Promise((resolve, reject) => {

                const socket = new WebSocket('ws://127.0.0.1:3000/bad/path');

                socket.onopen = () => {
                    reject();
                };

                socket.onerror = error => {
                    resolve();
                };
            }
        ));
    });

    it('http on websocket\'s port', async () => {
        app = createApp(App);
        app.init();

        await app.server.listen(3000);

        const result = await fetch(
            'get',
            'http://127.0.0.1:3000/ping'
        );
        should(result).eql({
            status    : 200,
            statusText: 'OK',
            body      : {
                ping: 'ok'
            }
        });
    });

    describe('use handler', () => {});
});

