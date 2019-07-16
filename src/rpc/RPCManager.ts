import { Injector, Service, Type } from '@dunai/core';
import { IPayload, IRPCManager, RPCControllerOptions, RPCManagerOptions } from './RPCManager.interface';
import { RPC_CONTROLLER_REFLECT_KEY } from './RPCController';

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
            const ctrlOptions: RPCControllerOptions = {
                prefix: '',
                ...Reflect.getMetadata(RPC_CONTROLLER_REFLECT_KEY, controller),
            };

            const ctrl = Injector.resolve<any>(controller);
            const methods = getMethods(ctrl);

            Object.keys(methods).forEach(key => {
                const method = ctrlOptions.prefix + key;
                this.methodHandlers[method] = {
                    method  : methods[key],
                    instance: ctrl,
                };
            });
        });
    }

    public call(method: string, payload: IPayload, session: IPayload): IPayload {
        return undefined;
    }

    public decode(payload: IPayload): IPayload {
        return undefined;
    }

    public encode(response: IPayload): IPayload {
        return undefined;
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
