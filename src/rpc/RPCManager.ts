import { Injector, runMethod, Service, Type } from '@dunai/core';
import { IPayload, IRPCManager, RPCControllerOptions, RPCManagerOptions } from './RPCManager.interface';
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
                return await runMethod(handler.instance, handler.method)(payload);
            } catch (e) {
                throw e;
            }
        throw new NotFoundError();
    }

    public decode(payload: IPayload): IPayload {
        throw new Error('not implements');
    }

    public encode(response: IPayload): IPayload {
        throw new Error('not implements');
    }
}

/**
 * Get all methods and property name from object and all prototypes
 * @param object
 * @return method - key map
 */
function getMethods(instance: any): { [method: string]: string } {
    const keys = {};
    let obj = instance;
    do {
        Object.getOwnPropertyNames(obj).map(key => {
            const method: string = Reflect.getMetadata('method', obj, key);
            if (method && !keys[key])
                keys[key] = method;
        });
        // tslint:disable-next-line
    } while ((obj = Object.getPrototypeOf(obj)));

    const methods: any = {};
    Object.keys(keys).forEach(key => {
        if (Array.isArray(keys[key]))
            keys[key].forEach(item => methods[item] = key);
        else
            methods[keys[key]] = key;
    });
    return methods;
}
