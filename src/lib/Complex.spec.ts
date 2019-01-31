/* tslint:disable */

import { Application, Injector } from '@dunai/core';
import { describe, it } from 'mocha';
import * as request from 'request';
import should from 'should';
import { HttpServer } from './HttpServer';
import { Action, Controller } from './Router';
import url from 'url';
import { fetch } from './utils.spec';

@Application()
class App {
    constructor(public server?: HttpServer) {}

    public init(): void {
        this.server.registerController('/api', ApiController);
        this.server.registerController('/', DefaultController);
    }
}

@Controller('Ping controller')
class DefaultController {
    @Action('get', '/')
    public index(req: any) {
        const urlInfo = url.parse(req.originalUrl);

        return req.res.json({
            headers : req.headers,
            method  : req.method,
            pathname: urlInfo.pathname,
            params  : req.params,
            query   : req.query,
            ping    : 'ok'
        });
    }
}

@Controller('API controller')
class ApiController {
    @Action(['put', 'get'], '/:id')
    public index(req: any, res: any) {
        const urlInfo = url.parse(req.originalUrl);

        return res.json({
            headers : req.headers,
            method  : req.method,
            pathname: urlInfo.pathname,
            params  : req.params,
            query   : req.query,
            api: 'ok'
        });
    }
}


let data = {
    ada    : 'asdasdasdasd',
    asdsgdf: '65uyhtfhg'
};

class FFF {
    public dfg = {
        dfgd: 'asdafgasd',
        tf  : 'sdfsd'
    };

    get index() {
        return data;
    }
}

function FFF1(data: any) {
    this.dfg = {
        dfgd: 'asdafgasd',
        tf  : 'sdfsd'
    };
    Object.defineProperty(this, 'index', {
        get(): any {
            return data;
        }
    });
}

const gg = new FFF;

console.log(gg);
console.log(JSON.stringify(gg, null, 2));

const gg1 = new FFF1(data);

console.log(gg1);
console.log(JSON.stringify(gg1, null, 2));

describe('HttpServer service', () => {
    beforeEach(() => {
        Injector.reset();
    });

    describe('listen and close', () => {
        it('port', async () => {
            const app = new App();

            await app.server.listen(3000);

            await app.server.close();

            await app.server.listen(3000);

            await app.server.close();
        });

        // it('port + hostname', () => {
        //    @Service()
        //    class MyService {}
        //
        //    const my: MyService = Injector.resolve<MyService>(MyService);
        //
        //    should(my).ok();
        //    should(my instanceof MyService).ok();
        // });
    });
    describe('registerController', () => {
        it('404', async () => {
            const app = new App();
            app.init();

            await app.server.listen(3000);

            const result = await fetch('get', 'http://127.0.0.1:3000/asdaafsda');
            should(result).equal('Page not found.');

            await app.server.close();
        });
        it('root', async () => {
            const app = new App();
            app.init();

            await app.server.listen(3000);

            const result = await fetch('get', 'http://127.0.0.1:3000/');
            should(JSON.parse(result)).eql({
                headers : {
                    host            : '127.0.0.1:3000',
                    'content-length': '0',
                    connection      : 'close'
                },
                method  : 'GET',
                pathname: '/',
                params  : {},
                query   : {},
                ping    : 'ok'
            });

            await app.server.close();
        });
        it('api with params and get', async () => {
            const app = new App();
            app.init();

            await app.server.listen(3000);

            const result = await fetch('put', 'http://127.0.0.1:3000/api/a?asd=asd');
            should(JSON.parse(result)).eql({
                headers : {
                    host            : '127.0.0.1:3000',
                    'content-length': '0',
                    connection      : 'close'
                },
                method  : 'PUT',
                pathname: '/api/a',
                params  : {
                    id: 'a'
                },
                query   : {
                    asd: 'asd'
                },
                api     : 'ok'
            });

            await app.server.close();
        });
    });
    describe('use handler', () => {});
});
