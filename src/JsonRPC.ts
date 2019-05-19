export interface JsonRPCOptions {

}

export interface IRPCRequest {
    method: string;
    path?: { [key: string]: any };
    get?: { [key: string]: any };
    post?: { [key: string]: any };
    body?: { [key: string]: any } | any[];
    params?: { [key: string]: any } | any[];
}

export interface IRPCResponse {

}


export interface IRequestHandler<IReq, IRes> {
    request(req: any): IRPCRequest;
    response(res: any): any;
    error(err: Error): any;

    registerController(ctrl: any): boolean;
}

export class HttpRequestHandler implements IRequestHandler<any, any> {
    request(req: Request): IRPCResponse {

    }

    response(res: any): IRPCResponse {

    }

}

/**
 * Делаем RPC хандлер
 * итого httpServer позволит зарегить http контроллеры (как и раньше) через registerController
 * и зарегать процедуру через registerRPCHandler(path?, handler: RPCHandler, controllers: [])
 *
 * RPC handler позволит подготовить запрос (метод request), и вернет объект со параметрами для вызова
 * отдаст их обработчику уже сам HttpServer
 *
 * он же передаст ответ от обработчика RPC handler (метод response) и уже полученный ответ отдаст в эксперсс или в вебсокет
 *
 * так же будет иметься обработчик ошибок (метод error) кооторый позволит корректно обработать ошибки
 */
export class JsonRPC implements IRequestHandler<IRPCRequest, IRPCResponse> {
    constructor(controllers: any[]) {}

    request(request: any): IRPCRequest {
        return request;
    }

    response(data: any): IRPCResponse {
        return data;
    }

    error(error: Error): IRPCResponse {
        return error;
    }
}
