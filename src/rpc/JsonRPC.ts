import { Service } from '@dunai/core';
import { RPCManager } from './RPCManager';
import { IPayload } from './RPCManager.interface';

@Service()
export class JsonRPC extends RPCManager {
    public encode(response: IPayload): IPayload {
        return {
            result: response
        };
    }
}
