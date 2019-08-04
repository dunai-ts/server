import { Injector } from '@dunai/core';
import bodyParser from 'body-parser';
import { describe, it } from 'mocha';
import should from 'should';
import { Application, createApp } from '../Application';
import { HttpServer } from '../HttpServer';
import { fetch } from '../utils.spec';
import { HttpPathRpcLinker } from './HttpPathRpcLinker';
import { RPCController } from './RPCController';
import { Method } from './Method';
import { RPCManager } from './RPCManager';

@RPCController('Ping controller')
class DefaultController {
    @Method('ping')
    public index(req: any, res: any) {
        return {
            ping: 'ok',
        };
    }
}

@RPCController('API controller', {
    prefix: 'data.',
})
class ApiController {
    @Method(['put', 'get'])
    public index(req: any, res: any) {
        return {
            api: 'ok',
        };
    }
}

@Application()
class App {
    public manager: RPCManager;

    constructor(public server?: HttpServer) {
        this.server.use(bodyParser.json() as any);

        this.manager = new RPCManager([
            ApiController,
            DefaultController,
        ]);

        this.server.registerController(
            '/api',
            new HttpPathRpcLinker(
                this.manager,
            ),
        );
    }
}

let app: App;

describe('Remote Procedure Call', () => {
    beforeEach(() => {
        Injector.reset();
        fetch('get', 'http://127.0.0.1:3000/test/b?foo=foo').then(
            result => {
                throw new Error('Address is busy');
            },
            error => {
                if (error.code !== 'ECONNREFUSED')
                    throw new Error('Address is busy');
            },
        );
    });
    afterEach(async () => {
        if (app && app.server)
            await app.server.close();
        app = null;
    });
    describe('Methods', () => {
        describe('standard express handler style', () => {
            it('minimum', async () => {
                app = createApp(App);
                await app.server.listen(3000);

                const result = await fetch(
                    'put',
                    'http://127.0.0.1:3000/api/ping',
                );
                should(result).eql({
                    status    : 200,
                    statusText: 'OK',
                    body      : {
                        ping: 'ok',
                    },
                });
            });

            //     it('synchronous', async () => {
            //
            //
            //         @Controller('Test controller')
            //         class TestController {
            //             @Route('put', '/:id')
            //             public index(req: any, res: any): void {
            //                 res.json({
            //                     id  : req.params['id'],
            //                     test: 'ok'
            //                 });
            //             }
            //         }
            //
            //         app = createApp(App);
            //         app.server.registerController('/test', TestController);
            //         await app.server.listen(3000);
            //
            //         const result = await fetch(
            //             'put',
            //             'http://127.0.0.1:3000/test/a?foo=foo'
            //         );
            //         should(result).eql({
            //             status    : 200,
            //             statusText: 'OK',
            //             body      : {
            //                 id  : 'a',
            //                 test: 'ok'
            //             }
            //         });
            //     });
            //     it('asynchronous (async / await)', async () => {
            //         @Controller('Test controller')
            //         class TestController {
            //             @Route('put', '/:id')
            //             public async index(req: any, res: any): Promise<void> {
            //                 res.json({
            //                     id  : req.params['id'],
            //                     test: 'ok2'
            //                 });
            //             }
            //         }
            //
            //         app = createApp(App);
            //         app.server.registerController('/test', TestController);
            //         await app.server.listen(3000);
            //
            //         const result = await fetch(
            //             'put',
            //             'http://127.0.0.1:3000/test/a?foo=foo'
            //         );
            //         should(result).eql({
            //             status    : 200,
            //             statusText: 'OK',
            //             body      : {
            //                 id  : 'a',
            //                 test: 'ok2'
            //             }
            //         });
            //     });
            // });
            // describe('return object', () => {
            //     it('synchronous', async () => {
            //         @Controller('Test controller')
            //         class TestController {
            //             @Route('get', '/:id')
            //             public index(req: any, res: any): any {
            //                 return {
            //                     id  : req.params['id'],
            //                     test: 'ok2'
            //                 };
            //             }
            //         }
            //
            //         app = createApp(App);
            //         app.server.registerController('/test', TestController);
            //         await app.server.listen(3000);
            //
            //         const result = await fetch(
            //             'get',
            //             'http://127.0.0.1:3000/test/a?foo=foo'
            //         );
            //         should(result).eql({
            //             status    : 200,
            //             statusText: 'OK',
            //             body      : {
            //                 id  : 'a',
            //                 test: 'ok2'
            //             }
            //             /**
            //              * List of actions in controller metadata
            //              * @private
            //              *
            //              * TODO rename to ControllerRoutes
            //              */
            //             export interface ControllerRoutes {
            //                 [key: string
            //     ]:
            //         RouteMeta;
            //     }
            //
            //         export interface IDecoratedParamHttpResolveData {
            //             http?: Request;
            //             ws?: any;
            //             [key: string]: any;
            //         }
            //
            //         /**
            //          * Route controller metadata
            //          * @private
            //          */
            //         export interface RouteControllerMeta extends ControllerMeta {
            //             _routes: ControllerRoutes;
            //             _route_params: { [key: string]: IMethodParamDecoration[] };
            //             _route_entity: { [key: string]: EntitySource[] };
            //         }
            //     })
            //         ;
            //     });
            //     it('asynchronous (async / await)', async () => {
            //         @Controller('Test controller')
            //         class TestController {
            //             @Route('put', '/:id')
            //             public async index(req: any, res: any): Promise<any> {
            //                 await sleep(100);
            //                 return {
            //                     id  : req.params['id'],
            //                     test: 'put_ok'
            //                 };
            //             }
            //         }
            //
            //         app = createApp(App);
            //         app.server.registerController('/test', TestController);
            //         await app.server.listen(3000);
            //
            //         const result = await fetch(
            //             'put',
            //             'http://127.0.0.1:3000/test/b?foo=foo'
            //         );
            //         should(result).eql({
            //             status    : 200,
            //             statusText: 'OK',
            //             body      : {
            //                 id  : 'b',
            //                 test: 'put_ok'
            //             }
            //         });
            //     });
            //     it('asynchronous + set status (async / await)', async () => {
            //         @Controller('Test controller')
            //         class TestController {
            //             @Route('put', '/:id')
            //             public async index(@Path('id') id: string, @HttpResponse() res: Response): Promise<any> {
            //                 await sleep(100);
            //                 res.status(404);
            //                 return {
            //                     id,
            //                     test: 'put_fail'
            //                 };
            //             }
            //         }
            //
            //         app = createApp(App);
            //         app.server.registerController('/test', TestController);
            //         await app.server.listen(3000);
            //
            //         const result = await fetch(
            //             'put',
            //             'http://127.0.0.1:3000/test/b?foo=foo'
            //         );
            //         should(result).eql({
            //             status    : 404,
            //             statusText: 'Not Found',
            //             body      : {
            //                 id  : 'b',
            //                 test: 'put_fail'
            //             }
            //         });
            //     });
            // });
        });
    });
});

function sleep(timeout = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
