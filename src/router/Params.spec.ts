import { Injector } from '@dunai/core';
import * as bodyParser from 'body-parser';
import { describe, it } from 'mocha';
import should from 'should';
import { Application, createApp } from '../Application';
import { Controller } from '../controller/Controller';
import { HttpServer } from '../HttpServer';
import { Request, Response } from '../Interfaces';
import { fetch } from '../utils.spec';
import { Body, HttpRequest, HttpResponse, Path, Query } from './Params';
import { Route } from './Router';

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

describe('Params', () => {
    let app: App;

    beforeEach(() => {
        Injector.reset();
    });

    afterEach(async () => {
        await app.server.close();
    });

    it('default (req, res)', async () => {
        @Controller('Test controller')
        class TestController {
            @Route('put', '/:id')
            public index(req: any, res: any) {
                return {
                    id  : req.params['id'],
                    test: 'ok'
                };
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
            body  : {
                id  : 'a',
                test: 'ok'
            }
        });
    });
    it('default (only req)', async () => {
        @Controller('Test controller')
        class TestController {
            @Route('put', '/:id')
            public index(req: any) {
                return {
                    id  : req.params['id'],
                    test: 'ok'
                };
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
            body  : {
                id  : 'a',
                test: 'ok'
            }
        });
    });
    it('default (req, _, @Path(_)', async () => {
        @Controller('Test controller')
        class TestController {
            @Route('put', '/:id')
            public index(req: any, _, @Path('id') id: string) {
                return {
                    id,
                    test: 'ok'
                };
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
            body  : {
                id  : 'a',
                test: 'ok'
            }
        });
    });
    it('default (req, @Path(), @Query(_))', async () => {
        @Controller('Test controller')
        class TestController {
            @Route('patch', '/:id')
            public index(
                req: any,
                @Path() id: object,
                @Query('foo') foo: string
            ) {
                return {
                    id,
                    foo,
                    test: 'ok'
                };
            }
        }

        app = createApp(App);
        app.server.registerController('/test', TestController);
        await app.server.listen(3000);

        const result = await fetch(
            'patch',
            'http://127.0.0.1:3000/test/a?foo=bar'
        );
        should(result).eql({
            status: 200,
            statusText: "OK",
            body  : {
                id  : { id: 'a' },
                foo : 'bar',
                test: 'ok'
            }
        });
    });
    it('default (req, @Path, @Body)', async () => {
        @Controller('Test controller')
        class TestController {
            @Route('patch', '/:id')
            public index(
                req: any,
                @Path('id') id: string,
                @Body('foo') foo: string
            ) {
                return {
                    id,
                    foo,
                    test: 'ok'
                };
            }
        }

        app = createApp(App);
        app.server.registerController('/test', TestController);
        await app.server.listen(3000);

        const result = await fetch(
            'patch',
            'http://127.0.0.1:3000/test/a',
            {
                foo: {
                    obj: 'bar'
                }
            }
        );
        should(result).eql({
            status: 200,
            statusText: "OK",
            body  : {
                id  : 'a',
                foo : {
                    obj: 'bar'
                },
                test: 'ok'
            }
        });
    });
    it('default (req, @Path, @Body - full body)', async () => {
        @Controller('Test controller')
        class TestController {
            @Route('patch', '/:id')
            public index(
                req: any,
                @Path('id') id: string,
                @Body() body: string
            ) {
                return {
                    id,
                    body,
                    test: 'ok'
                };
            }
        }

        app = createApp(App);
        app.server.registerController('/test', TestController);
        await app.server.listen(3000);

        const result = await fetch(
            'patch',
            'http://127.0.0.1:3000/test/a',
            {
                foo: {
                    obj: 'bar'
                }
            }
        );
        should(result).eql({
            status: 200,
            statusText: "OK",
            body  : {
                id  : 'a',
                body: {
                    foo: {
                        obj: 'bar'
                    }
                },
                test: 'ok'
            }
        });
    });
    it('http request (req, res, @HttpRequest, @HttpResponse)', async () => {
        @Controller('Test controller')
        class TestController {
            @Route('patch', '/:id')
            public index(
                req: any,
                res: any,
                @HttpRequest() httpReq: Request,
                @HttpResponse() httpRes: Response
            ) {
                should(req).equal(httpReq);
                should(res).equal(httpRes);
                return {
                    url: httpReq.url
                };
            }
        }

        app = createApp(App);
        app.server.registerController('/test', TestController);
        await app.server.listen(3000);

        const result = await fetch(
            'patch',
            'http://127.0.0.1:3000/test/a',
            {            }
        );
        should(result).eql({
            status: 200,
            statusText: "OK",
            body  : {
                url  : '/a',
            }
        });
    });
});
