import { Service } from '@dunai/core';
import { IWSClientManager } from './ClientManager.interface';

@Service()
export class WSClientManager<TClient> implements IWSClientManager {
    public clients: TClient[];

    constructor(clientClass: any) {

    }
}
