import { Injector } from '@dunai/core';
import { describe, it } from 'mocha';
import should from 'should';
import { Method } from './Method';
import { Param } from './Param';
import { RPCController } from './RPCController';
import { RPCManager } from './RPCManager';

@RPCController('Base controller')
class BaseController {
    @Method('base')
    public index(@Param('data') index: number) {
        return {
            ping: 'ok',
            index,
        };
    }
}

@RPCController('Ping controller')
class DefaultController extends BaseController {
    @Method('ping')
    public index(@Param('data') index: number) {
        return {
            ping: 'ok',
            index,
        };
    }
}

@RPCController('API controller', {
    prefix: 'data.',
})
class ApiController {
    @Method(['put', 'get'])
    public index(@Param('id') id: string, @Param('data') data: any) {
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
        it('methods list', () => {
            const manager = new RPCManager([
                DefaultController,
                ApiController,
            ]);

            should(manager.availableMethods).eql([
                'ping',
                'data.put',
                'data.get',
            ]);
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
