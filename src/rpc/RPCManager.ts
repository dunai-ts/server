import { Injector, runMethod, Service, Type } from '@dunai/core';
import { IPayload, IRPCManager, RPCManagerOptions } from './RPCManager.interface';
import { IRpcControllerMetadata, RPC_METADATA } from './RPCController';
import { NotFoundError } from '../router';

@Service()
export class RPCManager implements IRPCManager {
    private options: RPCManagerOptions;
    private methodHandlers: { [method: string]: { instance: any, method: string } } = {};

    get availableMethods(): string[] {
        return Object.keys(this.methodHandlers);
    }

    constructor(controllers: Array<Type<any>>, options?: RPCManagerOptions) {
        this.options = {
            unknownMethodHandler: null, // TODO
            ...options,
        };

        this.methodHandlers = {};
        controllers.forEach(controller => {

            const meta: IRpcControllerMetadata = Reflect.getMetadata(RPC_METADATA, controller);

            const ctrl = Injector.resolve<any>(controller);

            Object.keys(meta.methods).forEach(key => {
                const method = meta.options.prefix + key;
                this.methodHandlers[method] = {
                    method  : meta.methods[key],
                    instance: ctrl,
                };
            });
        });
    }

    public async call(method: string, payload: IPayload, session?: IPayload): Promise<IPayload> {
        if (this.methodHandlers[method])
            try {
                const handler = this.methodHandlers[method];
                const result = await runMethod(handler.instance, handler.method)(payload);
                return this.encode(result);
            } catch (e) {
                throw e;
            }
        throw new NotFoundError();
    }

    public decode(payload: IPayload): IPayload {
        throw new Error('not implements');
    }

    public encode(response: IPayload): IPayload {
        return response;
    }
}
