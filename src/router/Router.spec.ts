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
import { sessionFromCookie, sessionFromHeader, SessionStorageInMemory } from '../session/Session';
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
    describe('Methods', () => {
        it('different methods', async () => {
            @Controller()
            class TestController {
                @Route('get', '/')
                public get() {
                    return {
                        method: 'get'
                    };
                }
                @Route('post', '/')
                public post() {
                    return {
                        method: 'post'
                    };
                }
                @Route(['put', 'patch'], '/')
                public put() {
                    return {
                        method: 'put/patch'
                    };
                }
            }

            @Application()
            class TestApp {
                constructor(public server?: HttpServer) { }
            }

            app = createApp(TestApp) as any;
            app.server.registerController('/', TestController);
            await app.server.listen(3000);

            const result = await fetch(
                'get',
                'http://127.0.0.1:3000/'
            );
            should(result).eql({
                status    : 200,
                statusText: 'OK',
                body      : {
                    method: 'get'
                }
            });

            const result2 = await fetch(
                'post',
                'http://127.0.0.1:3000/'
            );
            should(result2).eql({
                status    : 200,
                statusText: 'OK',
                body      : {
                    method: 'post'
                }
            });

            const result3 = await fetch(
                'put',
                'http://127.0.0.1:3000/'
            );
            should(result3).eql({
                status    : 200,
                statusText: 'OK',
                body      : {
                    method: 'put/patch'
                }
            });

            const result4 = await fetch(
                'patch',
                'http://127.0.0.1:3000/'
            );
            should(result4).eql({
                status    : 200,
                statusText: 'OK',
                body      : {
                    method: 'put/patch'
                }
            });
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
                    status    : 200,
                    statusText: 'OK',
                    body      : {
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
                    status    : 200,
                    statusText: 'OK',
                    body      : {
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
                    status    : 200,
                    statusText: 'OK',
                    body      : {
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
                    status    : 200,
                    statusText: 'OK',
                    body      : {
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
                    status    : 404,
                    statusText: 'Not Found',
                    body      : {
                        id  : 'b',
                        test: 'put_fail'
                    }
                });
            });
        });
    });
});

function sleep(timeout = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
