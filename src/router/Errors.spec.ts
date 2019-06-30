import { Injector } from '@dunai/core';
import bodyParser from 'body-parser';
import { describe, it } from 'mocha';
import should from 'should';
import { Application, createApp } from '../Application';
import { Controller } from '../controller/Controller';
import { HttpServer } from '../HttpServer';
import { Response } from '../Interfaces';
import { fetch } from '../utils.spec';
import {
    ForbiddenError,
    IamaTeapotError, LockedError,
    MethodNotAllowedError,
    NotFoundError, TooManyRequestsError,
    UnauthorizedError,
    UnprocessableEntityError
} from './Errors';
import { HttpResponse, Path } from './Params';
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

let app: App;

describe('HTTP Errors', () => {
    beforeEach(() => {
        Injector.reset();
        fetch('get', 'http://127.0.0.1:3000/test/b?foo=foo').then(
            () => {
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
                status    : 404,
                statusText: 'Not Found',
                body      : {
                    code   : -32601,
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
                status    : 404,
                statusText: 'Not Found',
                body      : {
                    code   : -32601,
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
                    throw new NotFoundError('No any objects');
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
                status    : 404,
                statusText: 'Not Found',
                body      : {
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
                status    : 500,
                statusText: 'Internal Server Error',
                body      : {
                    code   : -32603,
                    message: 'Error: Some error',
                    details: {
                        stack: [
                            'TestController.index:169'
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
                    throw new UnauthorizedError('Invalid token');
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
                status    : 401,
                statusText: 'Unauthorized',
                body      : {
                    code   : -32090,
                    message: 'Invalid token'
                }
            });
        });
        it('ForbiddenError + async / await', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('get', '/:id')
                public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                    await sleep(100);
                    throw new ForbiddenError('Invalid role');
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
                status    : 403,
                statusText: 'Forbidden',
                body      : {
                    code   : -32091,
                    message: 'Invalid role'
                }
            });
        });
        it('MethodNotAllowedError + async / await', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('get', '/:id')
                public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                    await sleep(100);
                    throw new MethodNotAllowedError();
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
                status    : 405,
                statusText: 'Method Not Allowed',
                body      : {
                    code   : -32092,
                    message: 'Method Not Allowed'
                }
            });
        });
        it('IamaTeapotError + async / await', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('get', '/:id')
                public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                    await sleep(100);
                    throw new IamaTeapotError('Error message', -32601, { teapot: 'https://en.wikipedia.org/wiki/Teapot' });
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
                status    : 418,
                statusText: 'I\'m a Teapot',
                body      : {
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
                    throw new UnprocessableEntityError('You need send body');
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
                status    : 422,
                statusText: 'Unprocessable Entity',
                body      : {
                    code   : -32600,
                    message: 'You need send body'
                }
            });
        });
        it('LockedError + async / await', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('get', '/:id')
                public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                    await sleep(100);
                    throw new LockedError('Resource is locked');
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
                status    : 423,
                statusText: 'Locked',
                body      : {
                    code   : -32094,
                    message: 'Resource is locked'
                }
            });
        });
        it('TooManyRequestsError + async / await', async () => {
            @Controller('Test controller')
            class TestController {
                @Route('get', '/:id')
                public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
                    await sleep(100);
                    throw new TooManyRequestsError();
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
                status    : 429,
                statusText: 'Too Many Requests',
                body      : {
                    code   : -32095,
                    message: 'Too Many Requests'
                }
            });
        });
    });
});

function sleep(timeout = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
