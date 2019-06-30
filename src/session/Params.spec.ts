import { Injector } from '@dunai/core';
import * as bodyParser from 'body-parser';
import { describe, it } from 'mocha';
import should from 'should';
import { Application, createApp, HttpServer, Request, Response, Route } from '..';
import { Controller } from '../controller/Controller';
import { sessionFromCookie, sessionFromHeader, SessionStorageInMemory } from './Session';
import { fetch } from '../utils.spec';
import { Session } from './Params';

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

describe('Session', () => {
    let app: App;

    beforeEach(() => {
        Injector.reset();
    });

    afterEach(async () => {
        await app.server.close();
    });

    describe('Session id', () => {
        // TODO docs about writing middleware
        it('without session', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('put', '/:id')
                public index(req: Request, res: Response): void {
                    res.json({
                        session_id: req.session_id,
                        session   : req.session
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
                statusText: "OK",
                body  : {}
            });
        });

        it('sessionFromHeader', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('put', '/:id')
                public index(req: Request, res: Response): void {
                    res.session_id = 'changed_session_id';
                    res.json({
                        session_id: req.session_id
                    });
                }
            }

            app = createApp(App);
            app.server.setSessionStorage(
                sessionFromHeader(),
                SessionStorageInMemory
            );
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch(
                'put',
                'http://127.0.0.1:3000/test/a?foo=foo',
                {},
                {
                    headers: {
                        Authorization: 'Bearer 935ddceb2f6bbbb78363b224099f75c8'
                    }
                }
            );
            should(result).eql({
                status: 200,
                statusText: "OK",
                body  : {
                    session_id: '935ddceb2f6bbbb78363b224099f75c8'
                }
            });
        });

        it('sessionFromCookie', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('put', '/:id')
                public index(req: Request, res: Response): void {
                    res.session_id = 'changed_session_id';
                    res.json({
                        session_id: req.session_id
                    });
                }
            }

            app = createApp(App);
            app.server.setSessionStorage(
                sessionFromCookie(),
                SessionStorageInMemory
            );
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch(
                'put',
                'http://127.0.0.1:3000/test/a?foo=foo',
                {},
                {
                    headers: {
                        Cookie: 'session=935ddceb2f6bbbb78363b224099f75c8'
                    }
                }
            );
            should(result).eql({
                status : 200,
                statusText: "OK",
                headers: {
                    cookie: {
                        session: 'changed_session_id'
                    }
                },
                body   : {
                    session_id: '935ddceb2f6bbbb78363b224099f75c8'
                }
            });
        });

        it('in-memory session', async () => {
            @Controller('Test controller')
            class TestController {
                @Route(['get', 'put'], '/')
                public index(req: Request, res: Response): void {
                    if (req.body)
                        res.session.set(req.body);
                    res.session.set('changed', true);
                    res.json({
                        session_id: req.session_id,
                        session   : req.session
                    });
                }
            }

            app = createApp(App);
            app.server.setSessionStorage(
                sessionFromHeader(),
                SessionStorageInMemory
            );
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch(
                'put',
                'http://127.0.0.1:3000/test/',
                {
                    foo: 'bar'
                },
                {
                    headers: {
                        Authorization: 'Bearer 935ddceb2f6bbbb78363b224099f75c8'
                    }
                }
            );
            should(result).eql({
                status: 200,
                statusText: "OK",
                body  : {
                    session_id: '935ddceb2f6bbbb78363b224099f75c8',
                    session   : {}
                }
            });

            const result2 = await fetch(
                'get',
                'http://127.0.0.1:3000/test/',
                null,
                {
                    headers: {
                        Authorization: 'Bearer 935ddceb2f6bbbb78363b224099f75c8'
                    }
                }
            );
            should(result2).eql({
                status: 200,
                statusText: "OK",
                body  : {
                    session_id: '935ddceb2f6bbbb78363b224099f75c8',
                    session   : {
                        foo    : 'bar',
                        changed: true
                    }
                }
            });
        });

        it('default (req, @Session())', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('put', '/:id')
                public index(req: Request, @Session() session: any): void {
                    req.res.json({
                        session_id: req.session_id,
                        session
                    });
                }
            }

            app = createApp(App);
            app.server.setSessionStorage(
                sessionFromHeader(),
                SessionStorageInMemory
            );
            app.server.sessionStorage['storage']['SESSION_ID'] = {
                foo: 'bar'
            };
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch(
                'put',
                'http://127.0.0.1:3000/test/a?foo=foo',
                null,
                {
                    headers: {
                        Authorization: 'Bearer SESSION_ID'
                    }
                }
            );
            should(result).eql({
                status: 200,
                statusText: "OK",
                body  : {
                    session_id: 'SESSION_ID',
                    session   : {
                        foo: 'bar'
                    }
                }
            });
        });

        it('default (req, @Session(_))', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('put', '/:id')
                public index(req: Request, @Session('foo') foo: any): void {
                    req.res.json({
                        session_id: req.session_id,
                        foo
                    });
                }
            }

            app = createApp(App);
            app.server.setSessionStorage(
                sessionFromHeader(),
                SessionStorageInMemory
            );
            app.server.sessionStorage['storage']['SESSION_ID'] = {
                foo: 'bar'
            };
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch(
                'put',
                'http://127.0.0.1:3000/test/a?foo=foo',
                null,
                {
                    headers: {
                        Authorization: 'Bearer SESSION_ID'
                    }
                }
            );
            should(result).eql({
                status: 200,
                statusText: "OK",
                body  : {
                    session_id: 'SESSION_ID',
                    foo       : 'bar'
                }
            });
        });
    });

    describe('Check session', () => {
        function mockSession() {
            return (req: Request, res: Response, next: any) => {
                req.session_id = 'SESSION_ID';
                req.session    = {
                    foo: 'bar'
                };
                const ret      = next();
            };
        }

        it('without session', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('put', '/:id')
                public index(req: Request, res: Response): void {
                    res.json({
                        session_id: req.session_id,
                        session   : req.session
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
                statusText: "OK",
                body  : {}
            });
        });

        it('in-memory session', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('put', '/:id')
                public index(req: Request, res: Response): void {
                    res.json({
                        session_id: req.session_id,
                        session   : req.session
                    });
                }
            }

            app = createApp(App);
            app.server.use(mockSession());
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch(
                'put',
                'http://127.0.0.1:3000/test/a?foo=foo'
            );
            should(result).eql({
                status: 200,
                statusText: "OK",
                body  : {
                    session_id: 'SESSION_ID',
                    session   : {
                        foo: 'bar'
                    }
                }
            });
        });

        it('default (req, @Session())', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('put', '/:id')
                public index(req: Request, @Session() session: any): void {
                    req.res.json({
                        session_id: req.session_id,
                        session
                    });
                }
            }

            app = createApp(App);
            app.server.use(mockSession());
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch(
                'put',
                'http://127.0.0.1:3000/test/a?foo=foo'
            );
            should(result).eql({
                status: 200,
                statusText: "OK",
                body  : {
                    session_id: 'SESSION_ID',
                    session   : {
                        foo: 'bar'
                    }
                }
            });
        });

        it('default (req, @Session(_))', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('put', '/:id')
                public index(req: Request, @Session('foo') foo: string): void {
                    req.res.json({
                        session_id: req.session_id,
                        foo
                    });
                }
            }

            app = createApp(App);
            app.server.use(mockSession());
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch(
                'put',
                'http://127.0.0.1:3000/test/a?foo=foo'
            );
            should(result).eql({
                status: 200,
                statusText: "OK",
                body  : {
                    session_id: 'SESSION_ID',
                    foo       : 'bar'
                }
            });
        });
    });
});
