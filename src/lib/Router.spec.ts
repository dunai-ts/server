import { Application, Injector } from '@dunai/core';
import { Request } from 'express';
import { describe, it } from 'mocha';
import * as request from 'request';
import should from 'should';
import { HttpServer } from './HttpServer';
import { Action, Body, Controller, Entity, Path, Query } from './Router';
import { fetch } from './utils.spec';
import bodyParser = require('body-parser');
import { ActionMeta, EntityError } from './Common';

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
            should(result).eql({
                status: 200,
                body  : {
                    id  : 'a',
                    test: 'ok'
                }
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
            should(result).eql({
                status: 200,
                body  : {
                    id  : 'a',
                    test: 'ok'
                }
            });
        });
        it('default (req, _, @Path(_)', async () => {
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
            should(result).eql({
                status: 200,
                body  : {
                    id  : 'a',
                    test: 'ok'
                }
            });
        });
        it('default (req, @Path(), @Query(_))', async () => {
            @Controller('Test controller')
            class TestController {
                @Action('patch', '/:id')
                public index(req: any, @Path() id: object, @Query('foo') foo: string): void {
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
            should(result).eql({
                status: 200,
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
                status: 200,
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
                status: 200,
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
    });

    describe('Entity in params', () => {
        it('Sync getter (req, @Entity @Path, @Body)', async () => {
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
                status: 200,
                body  : {
                    path: {
                        id: 'a'
                    },
                    foo : {
                        obj: 'bar'
                    },
                    test: 'ok'
                }
            });
        });
        it('Promise (req, @Entity @Path, @Body)', async () => {
            class Test {
                static findByPk(id: string): Promise<Test> {
                    return new Promise<Test>((resolve, reject) => {
                        setTimeout(() => resolve(new Test({ id })), 100);
                    });
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
                status: 200,
                body  : {
                    path: {
                        id: 'a'
                    },
                    foo : {
                        obj: 'bar'
                    },
                    test: 'ok'
                }
            });
        });
        it('Promise - unhandled error (req, @Entity @Path, @Body)', async () => {
            class Test {
                static findByPk(id: string): Promise<Test> {
                    return new Promise<Test>((resolve, reject) => {
                        setTimeout(() => reject('Not found'), 100);
                    });
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
                status: 404,
                body  : 'Not found'
            });
        });
        it('Promise - handled error (req, @Entity @Path, @Body)', async () => {
            class Test {
                static findByPk(id: string): Promise<Test> {
                    return new Promise<Test>((resolve, reject) => {
                        setTimeout(() => reject('Invalid ID'), 100);
                    });
                }

                public id: string;

                constructor(data?: any) {
                    Object.assign(this, data);
                }
            }

            @Controller('Test controller')
            class TestController {
                @Action('patch', '/:id')
                public index(req: any,
                             @Entity(Test) @Path('id') path: Test,
                             @Body('foo') foo: object): void {
                    return req.res.json({
                        path,
                        foo,
                        test: 'ok'
                    });
                }

                public error(req: Request, res: Response, error: EntityError): void {
                    console.log('ERROR: ', error);
                    req.res.status(400).json({
                        error : error.message,
                        action: error.meta.action,
                        params: error.params
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
                status: 400,
                body  : {
                    error : 'Invalid ID',
                    action: 'index',
                    params: ['[request]', 'a', { obj: 'bar' }],
                }
            });
        });
    });
});
