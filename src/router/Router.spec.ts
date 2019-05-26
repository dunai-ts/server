import { Injector } from '@dunai/core';
import bodyParser from 'body-parser';
import { describe, it } from 'mocha';
import should from 'should';
import { Application, createApp } from '../Application';
import { EntityError } from '../Common';
import { Controller } from '../controller/Controller';
import { Entity } from '../entity/Params';
import { HttpServer } from '../HttpServer';
import { Request, Response } from '../Interfaces';
import { sessionFromCookie, sessionFromHeader, SessionStorageInMemory } from '../Session';
import { Session } from '../session/Params';
import { fetch } from '../utils.spec';
import {
    ForbiddenError,
    IamaTeapotError, LockedError,
    MethodNotAllowedError,
    NotFoundError, TooManyRequestsError,
    UnauthorizedError,
    UnprocessableEntityError
} from './Errors';
import { Body, HttpResponse, Path, Query } from './Params';
import { Action, Route } from './Router';

@Application()
class App {
    constructor(public server?: HttpServer) {
        this.server.use(bodyParser.json() as any);
    }

    public init(): void {
        this.server.registerController('/api', ApiController);
        this.server.registerController('/', DefaultController);
    }
}

@Controller('Ping controller')
class DefaultController {
    @Route('/')
    public index(req: any, res: any): void {
        return res.json({
            ping: 'ok'
        });
    }
}

@Controller('API controller')
class ApiController {
    @Route(['put', 'get'], '/:id')
    public index(req: any, res: any): void {
        return res.json({
            api: 'ok'
        });
    }
}

let app: App;

describe('Router service', () => {
    beforeEach(() => {
        Injector.reset();
        fetch('get', 'http://127.0.0.1:3000/test/b?foo=foo').then(
            result => {
                throw new Error('Address is busy');
            },
            error => {
                if (error.code !== 'ECONNREFUSED')
                    throw new Error('Address is busy');
            }
        );
    });
    afterEach(async () => {
        if (app && app.server)
            await app.server.close();
        app = null;
    });
    describe('Controller', () => {
        it('standard controller', () => {
            @Controller()
            class TestController {
                @Action('/')
                public index() {
                    // ok
                }
            }

            @Application()
            class TestApp {
                constructor(public server?: HttpServer) { }
            }

            app = createApp(TestApp) as any;

            app.server.registerController('/', TestController);

            should(app).ok();
        });
        // it('prepared controller', () => {
        //    @Controller()
        //    class TestController {
        //        @Route('/')
        //        public index() {
        //            // ok
        //        }
        //    }
        //
        //    const controller = new TestController()
        //
        //    @Application()
        //    class TestApp {
        //        constructor(public server?: HttpServer) { }
        //    }
        //
        //    const app = createApp(TestApp) as any;
        //
        //    app.server.registerController('/', controller);
        //    app.server.registerController('/api', controller);
        //
        //    should(app).ok();
        // });
        it('error if controller not contains actions', () => {
            @Controller()
            class TestController {
            }

            @Application()
            class TestApp {
                constructor(public server?: HttpServer) {
                    server.registerController('/', TestController);
                }
            }

            should(() => createApp(TestApp)).throw('Controller must be decorated by @Controller\n' +
                '  and must contain at least one action');
        });
        it('no decorated controller', () => {
            class TestController {

            }

            @Application()
            class TestApp {
                constructor(server?: HttpServer) {
                    server.registerController('/', TestController);
                }
            }

            should(() => createApp(TestApp)).throw('Controller must be decorated by @Controller\n' +
                '  and must contain at least one action');
        });
    });
    describe('Routes', () => {
        describe('standard express handler style', () => {
            it('synchronous', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('put', '/:id')
                    public index(req: any, res: any): void {
                        res.json({
                            id  : req.params['id'],
                            test: 'ok'
                        });
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'put',
                    'http://127.0.0.1:3000/test/a?foo=foo'
                );
                should(result).eql({
                    status: 200,
                    body  : {
                        id  : 'a',
                        test: 'ok'
                    }
                });
            });
            it('asynchronous (async / await)', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('put', '/:id')
                    public async index(req: any, res: any): Promise<void> {
                        res.json({
                            id  : req.params['id'],
                            test: 'ok2'
                        });
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'put',
                    'http://127.0.0.1:3000/test/a?foo=foo'
                );
                should(result).eql({
                    status: 200,
                    body  : {
                        id  : 'a',
                        test: 'ok2'
                    }
                });
            });
        });
        describe('return object', () => {
            it('synchronous', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('get', '/:id')
                    public index(req: any, res: any): any {
                        return {
                            id  : req.params['id'],
                            test: 'ok2'
                        };
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'get',
                    'http://127.0.0.1:3000/test/a?foo=foo'
                );
                should(result).eql({
                    status: 200,
                    body  : {
                        id  : 'a',
                        test: 'ok2'
                    }
                });
            });
            it('asynchronous (async / await)', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('put', '/:id')
                    public async index(req: any, res: any): Promise<any> {
                        await sleep(100);
                        return {
                            id  : req.params['id'],
                            test: 'put_ok'
                        };
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'put',
                    'http://127.0.0.1:3000/test/b?foo=foo'
                );
                should(result).eql({
                    status: 200,
                    body  : {
                        id  : 'b',
                        test: 'put_ok'
                    }
                });
            });
            it('asynchronous + set status (async / await)', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('put', '/:id')
                    public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                        await sleep(100);
                        res.status(404);
                        return {
                            id,
                            test: 'put_fail'
                        };
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'put',
                    'http://127.0.0.1:3000/test/b?foo=foo'
                );
                should(result).eql({
                    status: 404,
                    body  : {
                        id  : 'b',
                        test: 'put_fail'
                    }
                });
            });
        });
        describe('errors', () => {
            it('not found (incorrect controller)', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('put', '/:id')
                    public async index(req: any, res: Response): Promise<any> {
                        await sleep(100);
                        res.status(404);
                        return {
                            id  : req.params['id'],
                            test: 'put_fail'
                        };
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'put',
                    'http://127.0.0.1:3000/b?foo=foo'
                );
                should(result).eql({
                    status: 404,
                    body  : {
                        code   : 'not-found',
                        message: 'Not Found'
                    }
                });
            });
            it('not found (incorrect method)', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('put', '/:id')
                    public async index(req: any, res: Response): Promise<any> {
                        await sleep(100);
                        res.status(404);
                        return {
                            id  : req.params['id'],
                            test: 'put_fail'
                        };
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'get',
                    'http://127.0.0.1:3000/b?foo=foo'
                );
                should(result).eql({
                    status: 404,
                    body  : {
                        code   : 'not-found',
                        message: 'Not Found'
                    }
                });
            });
            it('NotFoundError + async / await', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('get', '/:id')
                    public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                        await sleep(100);
                        throw new NotFoundError(-32601, 'No any objects');
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'get',
                    'http://127.0.0.1:3000/test/b?foo=foo'
                );
                should(result).eql({
                    status: 404,
                    body  : {
                        code   : -32601,
                        message: 'No any objects'
                    }
                });
            });
            it('standard Error + async / await', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('get', '/:id')
                    public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                        await sleep(100);
                        throw new Error('Some error');
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'get',
                    'http://127.0.0.1:3000/test/b?foo=foo'
                );
                should(result).eql({
                    status: 500,
                    body  : {
                        code   : 'server-error',
                        message: 'Error: Some error',
                        details: {
                            stack: [
                                'TestController.index:393'
                            ]
                        }
                    }
                });
            });
            it('UnauthorizedError + async / await', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('get', '/:id')
                    public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                        await sleep(100);
                        throw new UnauthorizedError(-32601, 'Error message');
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'get',
                    'http://127.0.0.1:3000/test/b?foo=foo'
                );
                should(result).eql({
                    status: 401,
                    body  : {
                        code   : -32601,
                        message: 'Error message'
                    }
                });
            });
            it('ForbiddenError + async / await', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('get', '/:id')
                    public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                        await sleep(100);
                        throw new ForbiddenError(-32601, 'Error message');
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'get',
                    'http://127.0.0.1:3000/test/b?foo=foo'
                );
                should(result).eql({
                    status: 403,
                    body  : {
                        code   : -32601,
                        message: 'Error message'
                    }
                });
            });
            it('MethodNotAllowedError + async / await', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('get', '/:id')
                    public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                        await sleep(100);
                        throw new MethodNotAllowedError(-32601, 'Error message');
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'get',
                    'http://127.0.0.1:3000/test/b?foo=foo'
                );
                should(result).eql({
                    status: 405,
                    body  : {
                        code   : -32601,
                        message: 'Error message'
                    }
                });
            });
            it('IamaTeapotError + async / await', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('get', '/:id')
                    public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                        await sleep(100);
                        throw new IamaTeapotError(-32601, 'Error message', { teapot: 'https://en.wikipedia.org/wiki/Teapot' });
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'get',
                    'http://127.0.0.1:3000/test/b?foo=foo'
                );
                should(result).eql({
                    status: 418,
                    body  : {
                        code   : -32601,
                        message: 'Error message',
                        details: {
                            teapot: 'https://en.wikipedia.org/wiki/Teapot'
                        }
                    }
                });
            });
            it('UnprocessableEntityError + async / await', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('get', '/:id')
                    public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                        await sleep(100);
                        throw new UnprocessableEntityError(-32601, 'Error message');
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'get',
                    'http://127.0.0.1:3000/test/b?foo=foo'
                );
                should(result).eql({
                    status: 422,
                    body  : {
                        code   : -32601,
                        message: 'Error message'
                    }
                });
            });
            it('LockedError + async / await', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('get', '/:id')
                    public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                        await sleep(100);
                        throw new LockedError(-32601, 'Error message');
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'get',
                    'http://127.0.0.1:3000/test/b?foo=foo'
                );
                should(result).eql({
                    status: 423,
                    body  : {
                        code   : -32601,
                        message: 'Error message'
                    }
                });
            });
            it('TooManyRequestsError + async / await', async () => {
                @Controller('Test controller')
                class TestController {
                    @Route('get', '/:id')
                    public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                        await sleep(100);
                        throw new TooManyRequestsError(-32601, 'Error message');
                    }
                }

                app = createApp(App);
                app.server.registerController('/test', TestController);
                await app.server.listen(3000);

                const result = await fetch(
                    'get',
                    'http://127.0.0.1:3000/test/b?foo=foo'
                );
                should(result).eql({
                    status: 429,
                    body  : {
                        code   : -32601,
                        message: 'Error message'
                    }
                });
            });
        });
    });
});

function sleep(timeout = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
