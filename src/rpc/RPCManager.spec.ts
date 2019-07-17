import { Injector } from '@dunai/core';
import { describe, it } from 'mocha';
import should from 'should';
import { Method } from './Method';
import { Param } from './Param';
import { RPCController } from './RPCController';
import { RPCManager } from './RPCManager';
import { Session } from '../session';

@RPCController('Base controller', {
    prefix: 'base.',
})
class BaseController {
    @Method('base')
    public index(@Param('index') index: number) { // TODO
        return {
            ctrl  : 'base',
            method: 'base',
            index,
        };
    }

    @Method('inherit')
    public inheritMethod(@Param('index') index: number) {
        return {
            ctrl  : 'base',
            method: 'inherit',
            index,
        };
    }

    @Method('check')
    public check(@Param('index') index: number) {
        return {
            ctrl  : 'base',
            method: 'check',
            index,
        };
    }
}

@RPCController('Ping controller')
class DefaultController extends BaseController {
    @Method(['ping'])
    public index(@Param('index') index: number) { // TODO
        return {
            ctrl  : 'default',
            method: 'ping',
            index,
        };
    }

    public check(@Param('index') index: number) {
        return {
            ctrl  : 'default',
            method: 'check',
            index,
        };
    }

    @Method('default')
    public default(@Param('index') index: number) {
        return {
            ctrl  : 'default',
            method: 'default',
            index,
        };
    }
}

@RPCController('API controller', {
    prefix: 'data.',
})
class ApiController {
    @Method(['put', 'get'])
    public index(@Param('id') id: string, @Param('data') data?: any) {
        return {
            id,
            data,
        };
    }
}

describe('Remote Procedure Call', () => {
    beforeEach(() => {
        Injector.reset();
    });
    describe('Methods', () => {
        let manager: RPCManager;

        beforeEach(() => {
            manager = new RPCManager([
                DefaultController,
                ApiController,
            ]);
        });

        it('methods list', () => {
            should(manager.availableMethods).eql([
                'inherit',
                'ping',
                'check',
                'default',
                'data.put',
                'data.get',
            ]);
        });

        it('call own method "default"', async () => {
            const result = await manager.call('default', { index: 2 });

            should(result).eql({
                ctrl  : 'default',
                method: 'default',
                index : 2,
            });
        });

        it('call inherit method "inherit"', async () => {
            const result = await manager.call('inherit', { index: 1 });

            should(result).eql({
                ctrl  : 'base',
                method: 'inherit',
                index : 1,
            });
        });

        it('call overloaded not decorated method "check"', async () => {
            const result = await manager.call('check', { index: 2 });

            should(result).eql({
                ctrl  : 'default',
                method: 'check',
                index : 2,
            });
        });

        it('call overload decorated method "ping"', async () => {
            const result = await manager.call('ping', { index: 2 });

            should(result).eql({
                ctrl  : 'default',
                method: 'ping',
                index : 2,
            });
        });

        it('call overload decorated (not exists) method "base"', async () => {
            manager.call('base', { index: 2 })
                .then(
                    () => should('Method must return error'),
                    () => should(true).true(),
                );
        });

        it('call own method with prefix "data.get"', async () => {
            const result = await manager.call('data.get', { id: '2' });

            should(result).eql({
                id  : '2',
                data: undefined,
            });
        });

        it('call own method with prefix "data.put"', async () => {
            const result = await manager.call('data.put', { id: '2', data: {} });

            should(result).eql({
                id  : '2',
                data: {},
            });
        });

        // it('minimum', async () => {
        //     const manager = new RPCManager([
        //         DefaultController,
        //         ApiController,
        //     ]);
        //
        //     const result = manager.call(
        //         'ping',
        //         {
        //             index: 1,
        //         },
        //         {},
        //     );
        //
        //     should(result).eql({
        //         ping : 'ok',
        //         index: 1,
        //     });
        // });
    });
});

function sleep(timeout = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
