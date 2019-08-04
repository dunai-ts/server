import { Controller } from '../controller';
import { Body, Path, Query, Route } from '../router';
import { IRPCManager } from './RPCManager.interface';

export interface IHttpPathRpcLinkerOptions {
    prefix?: string;
    suffix?: string;
}

@Controller()
export class HttpPathRpcLinker {
    constructor(private manager: IRPCManager,
                private options: IHttpPathRpcLinkerOptions = {}) {}

    @Route('post', '/:method')
    private post(@Path('method') query: string,
                 @Body() params: any) {
        const method = this.getMethod(query);
        console.log(`Call method post "${method}"`, params);

        return this.manager.call(method, params);
    }

    @Route('get', '/:method')
    private index(@Path('method') query: string,
                  @Query() params: any) {
        const method = this.getMethod(query);
        console.log(`Call method get "${method}"`, params);

        return this.manager.call(method, params);
    }

    private getMethod(query: string): string {
        let method = query;

        if (this.options.prefix) {
            const prefix = this.options.prefix;
            if (method.substr(0, prefix.length) === prefix)
                method = method.substr(prefix.length);
        }

        if (this.options.suffix) {
            const suffix = this.options.suffix;
            if (method.substr(-suffix.length) === suffix)
                method = method.substr(0, method.length - suffix.length);
        }

        return method;
    }
}
