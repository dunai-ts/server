import { Injector } from '@dunai/core';
import * as bodyParser from 'body-parser';
import { describe, it } from 'mocha';
import should from 'should';
import { Application, createApp, EntityError, HttpServer, Request, Response, Route } from '..';
import { Controller } from '../controller/Controller';
import { Body, Path } from '../router/Params';
import { fetch } from '../utils.spec';
import { Entity } from './Params';

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
    public index(req: any, res: any) {
        return {
            ping: 'ok'
        };
    }
}

@Controller('API controller')
class ApiController {
    @Route(['put', 'get'], '/:id')
    public index(req: any, res: any) {
        return {
            api: 'ok'
        };
    }
}

describe('Entity in params', () => {
    let app: App;

    beforeEach(() => {
        Injector.reset();
    });

    afterEach(async () => {
        await app.server.close();
    });

    //it('Sync getter (req, @Entity @Path, @Body)', async () => {
    //    class Test {
    //        public static findByPk(id: string): Test {
    //            return new Test({ id });
    //        }
    //
    //        public id: string;
    //
    //        constructor(data?: any) {
    //            Object.assign(this, data);
    //        }
    //    }
    //
    //    @Controller('Test controller')
    //    class TestController {
    //        @Route('patch', '/:id')
    //        public index(
    //            req: any,
    //            @Entity(Test) @Path('id') path: string,
    //            @Body('foo') foo: string
    //        ): void {
    //            return req.res.json({
    //                path,
    //                foo,
    //                test: 'ok'
    //            });
    //        }
    //    }
    //
    //    app = createApp(App);
    //    app.server.registerController('/test', TestController);
    //    await app.server.listen(3000);
    //
    //    const result = await fetch(
    //        'patch',
    //        'http://127.0.0.1:3000/test/a',
    //        {
    //            foo: {
    //                obj: 'bar'
    //            }
    //        }
    //    );
    //    should(result).eql({
    //        status: 200,
    //        body  : {
    //            path: {
    //                id: 'a'
    //            },
    //            foo : {
    //                obj: 'bar'
    //            },
    //            test: 'ok'
    //        }
    //    });
    //});
    //it('Promise (req, @Entity @Path, @Body)', async () => {
    //    class Test {
    //        public static findByPk(id: string): Promise<Test> {
    //            return new Promise<Test>((resolve, reject) => {
    //                setTimeout(() => resolve(new Test({ id })), 10);
    //            });
    //        }
    //
    //        public id: string;
    //
    //        constructor(data?: any) {
    //            Object.assign(this, data);
    //        }
    //    }
    //
    //    @Controller('Test controller')
    //    class TestController {
    //        @Route('patch', '/:id')
    //        public index(
    //            req: any,
    //            @Entity(Test) @Path('id') path: string,
    //            @Body('foo') foo: string
    //        ): void {
    //            return req.res.json({
    //                path,
    //                foo,
    //                test: 'ok'
    //            });
    //        }
    //    }
    //
    //    app = createApp(App);
    //    app.server.registerController('/test', TestController);
    //    await app.server.listen(3000);
    //
    //    const result = await fetch(
    //        'patch',
    //        'http://127.0.0.1:3000/test/a',
    //        {
    //            foo: {
    //                obj: 'bar'
    //            }
    //        }
    //    );
    //    should(result).eql({
    //        status: 200,
    //        body  : {
    //            path: {
    //                id: 'a'
    //            },
    //            foo : {
    //                obj: 'bar'
    //            },
    //            test: 'ok'
    //        }
    //    });
    //});
    //it('Promise - unhandled error (req, @Entity @Path, @Body)', async () => {
    //    class Test {
    //        public static findByPk(id: string): Promise<Test> {
    //            return new Promise<Test>((resolve, reject) => {
    //                setTimeout(() => reject('Not found'), 10);
    //            });
    //        }
    //
    //        public id: string;
    //
    //        constructor(data?: any) {
    //            Object.assign(this, data);
    //        }
    //    }
    //
    //    @Controller('Test controller')
    //    class TestController {
    //        @Route('patch', '/:id')
    //        public index(
    //            req: any,
    //            @Entity(Test) @Path('id') path: string,
    //            @Body('foo') foo: string
    //        ): void {
    //            return req.res.json({
    //                path,
    //                foo,
    //                test: 'ok'
    //            });
    //        }
    //    }
    //
    //    app = createApp(App);
    //    app.server.registerController('/test', TestController);
    //    await app.server.listen(3000);
    //
    //    const result = await fetch(
    //        'patch',
    //        'http://127.0.0.1:3000/test/a',
    //        {
    //            foo: {
    //                obj: 'bar'
    //            }
    //        }
    //    );
    //    should(result).eql({
    //        status: 404,
    //        body  : 'Not found'
    //    });
    //});
    //it('Promise - handled error (req, @Entity @Path, @Body)', async () => {
    //    class Test {
    //        public static findByPk(id: string): Promise<Test> {
    //            return new Promise<Test>((resolve, reject) => {
    //                setTimeout(() => reject('Invalid ID'), 10);
    //            });
    //        }
    //
    //        public id: string;
    //
    //        constructor(data?: any) {
    //            Object.assign(this, data);
    //        }
    //    }
    //
    //    @Controller('Test controller')
    //    class TestController {
    //        @Route('patch', '/:id')
    //        public index(
    //            req: any,
    //            @Entity(Test) @Path('id') path: Test,
    //            @Body('foo') foo: object
    //        ): void {
    //            return req.res.json({
    //                path,
    //                foo,
    //                test: 'ok'
    //            });
    //        }
    //
    //        public error(
    //            _: Request,
    //            res: Response,
    //            error: EntityError
    //        ): void {
    //            res.status(400).json({
    //                error : error.message,
    //                action: error.meta.action,
    //                params: error.params
    //            });
    //        }
    //    }
    //
    //    app = createApp(App);
    //    app.server.registerController('/test', TestController);
    //    await app.server.listen(3000);
    //
    //    const result = await fetch(
    //        'patch',
    //        'http://127.0.0.1:3000/test/a',
    //        {
    //            foo: {
    //                obj: 'bar'
    //            }
    //        }
    //    );
    //    should(result).eql({
    //        status: 400,
    //        body  : {
    //            error : 'Invalid ID',
    //            action: 'index',
    //            params: ['[request]', 'a', { obj: 'bar' }]
    //        }
    //    });
    //});
    //it('error before create Promise - handled error (req, @Entity @Path, @Body)', async () => {
    //    class TError extends Error {
    //        public details: string = 'some details';
    //    }
    //
    //    class Test {
    //        public static findByPk(id: string): Promise<Test> {
    //            throw new TError('Test error');
    //
    //            return new Promise<Test>((resolve, reject) => {
    //                setTimeout(() => reject('Invalid ID'), 10);
    //            });
    //        }
    //
    //        public id: string;
    //
    //        constructor(data?: any) {
    //            Object.assign(this, data);
    //        }
    //    }
    //
    //    @Controller('Test controller')
    //    class TestController {
    //        @Route('patch', '/:id')
    //        public index(
    //            req: any,
    //            @Entity(Test) @Path('id') path: Test,
    //            @Body('foo') foo: object
    //        ): void {
    //            return req.res.json({
    //                path,
    //                foo,
    //                test: 'ok'
    //            });
    //        }
    //
    //        public error(
    //            _: Request,
    //            res: Response,
    //            error: EntityError
    //        ): void {
    //            res.status(400).json({
    //                error  : error.message,
    //                details: error['details'],
    //                action : error.meta.action,
    //                params : error.params
    //            });
    //        }
    //    }
    //
    //    app = createApp(App);
    //    app.server.registerController('/test', TestController);
    //    await app.server.listen(3000);
    //
    //    const result = await fetch(
    //        'patch',
    //        'http://127.0.0.1:3000/test/a',
    //        {
    //            foo: {
    //                obj: 'bar'
    //            }
    //        }
    //    );
    //    should(result).eql({
    //        status: 400,
    //        body  : {
    //            error  : 'Test error',
    //            details: 'some details',
    //            action : 'index',
    //            params : ['[request]', 'a', { obj: 'bar' }]
    //        }
    //    });
    //});
    //it('function - handled error (req, @Entity @Path, @Body)', async () => {
    //    function findByPk(id: string): Promise<Test> {
    //        return new Promise<Test>((resolve, reject) => {
    //            setTimeout(() => reject('Invalid ID'), 10);
    //        });
    //    }
    //
    //    class Test {
    //        public id: string;
    //
    //        constructor(data?: any) {
    //            Object.assign(this, data);
    //        }
    //    }
    //
    //    @Controller('Test controller')
    //    class TestController {
    //        @Route('patch', '/:id')
    //        public index(
    //            req: any,
    //            @Entity(findByPk) @Path('id') path: Test,
    //            @Body('foo') foo: object
    //        ): void {
    //            return req.res.json({
    //                path,
    //                foo,
    //                test: 'ok'
    //            });
    //        }
    //
    //        public error(
    //            _: Request,
    //            res: Response,
    //            error: EntityError
    //        ): void {
    //            res.status(400).json({
    //                error : error.message,
    //                action: error.meta.action,
    //                params: error.params
    //            });
    //        }
    //    }
    //
    //    app = createApp(App);
    //    app.server.registerController('/test', TestController);
    //    await app.server.listen(3000);
    //
    //    const result = await fetch(
    //        'patch',
    //        'http://127.0.0.1:3000/test/a',
    //        {
    //            foo: {
    //                obj: 'bar'
    //            }
    //        }
    //    );
    //    should(result).eql({
    //        status: 400,
    //        body  : {
    //            error : 'Invalid ID',
    //            action: 'index',
    //            params: ['[request]', 'a', { obj: 'bar' }]
    //        }
    //    });
    //});
    //it('error in function - handled error (req, @Entity @Path, @Body)', async () => {
    //    function findByPk(id: string): Promise<Test> {
    //        throw new Error('throw error');
    //
    //        return new Promise<Test>((resolve, reject) => {
    //            setTimeout(() => reject('Invalid ID'), 10);
    //        });
    //    }
    //
    //    class Test {
    //        public id: string;
    //
    //        constructor(data?: any) {
    //            Object.assign(this, data);
    //        }
    //    }
    //
    //    @Controller('Test controller')
    //    class TestController {
    //        @Route('patch', '/:id')
    //        public index(
    //            req: any,
    //            @Entity(findByPk) @Path('id') path: Test,
    //            @Body('foo') foo: object
    //        ): void {
    //            return req.res.json({
    //                path,
    //                foo,
    //                test: 'ok'
    //            });
    //        }
    //
    //        public error(
    //            _: Request,
    //            res: Response,
    //            error: EntityError
    //        ): void {
    //            res.status(400).json({
    //                error : error.message,
    //                action: error.meta.action,
    //                params: error.params
    //            });
    //        }
    //    }
    //
    //    app = createApp(App);
    //    app.server.registerController('/test', TestController);
    //    await app.server.listen(3000);
    //
    //    const result = await fetch(
    //        'patch',
    //        'http://127.0.0.1:3000/test/a',
    //        {
    //            foo: {
    //                obj: 'bar'
    //            }
    //        }
    //    );
    //    should(result).eql({
    //        status: 400,
    //        body  : {
    //            error : 'throw error',
    //            action: 'index',
    //            params: ['[request]', 'a', { obj: 'bar' }]
    //        }
    //    });
    //});
    //it('real error in promise function - handled error (req, @Entity @Path, @Body)', async () => {
    //    function findByPk(id: string): Promise<string> {
    //        return new Promise(resolve => {
    //            const g: string = null;
    //            resolve(g.substr(0, 10));
    //        });
    //    }
    //
    //    @Controller('Test controller')
    //    class TestController {
    //        @Route('patch', '/:id')
    //        public index(
    //            req: any,
    //            @Entity(findByPk) @Path('id') path: string,
    //            @Body('foo') foo: object
    //        ): void {
    //            return req.res.json({
    //                path,
    //                foo,
    //                test: 'ok'
    //            });
    //        }
    //
    //        public error(
    //            _: Request,
    //            res: Response,
    //            error: EntityError
    //        ): void {
    //            res.status(400).json({
    //                error : error.message,
    //                action: error.meta.action,
    //                params: error.params
    //            });
    //        }
    //    }
    //
    //    app = createApp(App);
    //    app.server.registerController('/test', TestController);
    //    await app.server.listen(3000);
    //
    //    const result = await fetch(
    //        'patch',
    //        'http://127.0.0.1:3000/test/a',
    //        {
    //            foo: {
    //                obj: 'bar'
    //            }
    //        }
    //    );
    //    should(result).eql({
    //        status: 400,
    //        body  : {
    //            error : 'Cannot read property \'substr\' of null',
    //            action: 'index',
    //            params: ['[request]', 'a', { obj: 'bar' }]
    //        }
    //    });
    //});
    //it('real error in function - handled error (req, @Entity @Path, @Body)', async () => {
    //    function findByPk(id: string): string {
    //        const g: string = null;
    //        return g.substr(0, 10);
    //    }
    //
    //    @Controller('Test controller')
    //    class TestController {
    //        @Route('patch', '/:id')
    //        public index(
    //            req: any,
    //            @Entity(findByPk) @Path('id') path: string,
    //            @Body('foo') foo: object
    //        ): void {
    //            return req.res.json({
    //                path,
    //                foo,
    //                test: 'ok'
    //            });
    //        }
    //
    //        public error(
    //            req: Request,
    //            res: Response,
    //            error: EntityError
    //        ): void {
    //            res.status(400).json({
    //                error : error.message,
    //                action: error.meta.action,
    //                params: error.params
    //            });
    //        }
    //    }
    //
    //    app = createApp(App);
    //    app.server.registerController('/test', TestController);
    //    await app.server.listen(3000);
    //
    //    const result = await fetch(
    //        'patch',
    //        'http://127.0.0.1:3000/test/a',
    //        {
    //            foo: {
    //                obj: 'bar'
    //            }
    //        }
    //    );
    //    should(result).eql({
    //        status: 400,
    //        body  : {
    //            action: 'index',
    //            error : 'Cannot read property \'substr\' of null',
    //            params: ['[request]', 'a', { obj: 'bar' }]
    //        }
    //    });
    //});
});
