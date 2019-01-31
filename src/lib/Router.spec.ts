import { Application, Injector } from '@dunai/core';
import { describe, it } from 'mocha';
import * as request from 'request';
import should from 'should';
import { HttpServer } from './HttpServer';
import { Action, Body, Controller, Path, Query } from './Router';
import { fetch } from './utils.spec';
import bodyParser = require('body-parser');

@Application()
class App {
    constructor(public server?: HttpServer) {
        this.server.use(bodyParser.json());
    }

    public init(): void {
        this.server.registerController('/api', ApiController);
        this.server.registerController('/', DefaultController);
    }
}

@Controller('Ping controller')
class DefaultController {
    @Action('/')
    public index(req: any, res: any) {
        return res.json({
            ping: 'ok'
        });
    }
}

@Controller('API controller')
class ApiController {
    @Action(['put', 'get'], '/:id')
    public index(req: any, res: any) {
        return res.json({
            api: 'ok'
        });
    }
}

let app: App;

describe('Router service', () => {
    beforeEach(() => {
        Injector.reset();
    });

    afterEach(async () => {
        await app.server.close();
    });

    describe('params', () => {
        it('default (req, res)', async () => {
            @Controller('Test controller')
            class TestController {
                @Action('put', '/:id')
                public index(req: any, res: any): void {
                    return res.json({
                        id  : req.params['id'],
                        test: 'ok'
                    });
                }
            }

            app = new App();
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch('put', 'http://127.0.0.1:3000/test/a?foo=foo');
            should(JSON.parse(result)).eql({
                id  : 'a',
                test: 'ok'
            });
        });
        it('default (only req)', async () => {
            @Controller('Test controller')
            class TestController {
                @Action('put', '/:id')
                public index(req: any): void {
                    return req.res.json({
                        id  : req.params['id'],
                        test: 'ok'
                    });
                }
            }

            app = new App();
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch('put', 'http://127.0.0.1:3000/test/a?foo=foo');
            should(JSON.parse(result)).eql({
                id  : 'a',
                test: 'ok'
            });
        });
        it('default (req, _, @Path)', async () => {
            @Controller('Test controller')
            class TestController {
                @Action('put', '/:id')
                public index(req: any, _, @Path('id') id: string): void {
                    return req.res.json({
                        id,
                        test: 'ok'
                    });
                }
            }

            app = new App();
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch('put', 'http://127.0.0.1:3000/test/a?foo=foo');
            should(JSON.parse(result)).eql({
                id  : 'a',
                test: 'ok'
            });
        });
        it('default (req, @Path, @Query)', async () => {
            @Controller('Test controller')
            class TestController {
                @Action('patch', '/:id')
                public index(req: any, @Path('id') id: string, @Query('foo') foo: string): void {
                    return req.res.json({
                        id,
                        foo,
                        test: 'ok'
                    });
                }
            }

            app = new App();
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch('patch', 'http://127.0.0.1:3000/test/a?foo=bar');
            should(JSON.parse(result)).eql({
                id  : 'a',
                foo : 'bar',
                test: 'ok'
            });
        });
        it('default (req, @Path, @Body)', async () => {
            @Controller('Test controller')
            class TestController {
                @Action('patch', '/:id')
                public index(req: any, @Path('id') id: string, @Body('foo') foo: string): void {
                    return req.res.json({
                        id,
                        foo,
                        test: 'ok'
                    });
                }
            }

            app = new App();
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch('patch', 'http://127.0.0.1:3000/test/a', {
                foo: {
                    obj: 'bar'
                }
            });
            should(result).eql({
                id  : 'a',
                foo : {
                    obj: 'bar'
                },
                test: 'ok'
            });
        });
        it('default (req, @Path, @Body - full body)', async () => {
            @Controller('Test controller')
            class TestController {
                @Action('patch', '/:id')
                public index(req: any, @Path('id') id: string, @Body() body: string): void {
                    return req.res.json({
                        id,
                        body,
                        test: 'ok'
                    });
                }
            }

            app = new App();
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch('patch', 'http://127.0.0.1:3000/test/a', {
                foo: {
                    obj: 'bar'
                }
            });
            should(result).eql({
                id  : 'a',
                body: {
                    foo: {
                        obj: 'bar'
                    }
                },
                test: 'ok'
            });
        });
    });

    describe('Entity in params', () => {
        it('default (req, @Entity @Path, @Body)', async () => {
            function Entity(type: any) {
                return (target: any, field: string, index: number) => {

                };
            }

            class Test {
                static findByPk(id: string): Test {
                    return new Test({ id });
                }

                public id: string;

                constructor(data?: any) {
                    Object.assign(this, data);
                }
            }

            @Controller('Test controller')
            class TestController {
                @Action('patch', '/:id')
                public index(req: any, @Entity(Test) @Path('id') path: string, @Body('foo') foo: string): void {
                    return req.res.json({
                        path,
                        foo,
                        test: 'ok'
                    });
                }
            }

            app = new App();
            app.server.registerController('/test', TestController);
            await app.server.listen(3000);

            const result = await fetch('patch', 'http://127.0.0.1:3000/test/a', {
                foo: {
                    obj: 'bar'
                }
            });
            should(result).eql({
                path: new Test({
                    id: 'a'
                }),
                foo : {
                    obj: 'bar'
                },
                test: 'ok'
            });
        });
    });
});
