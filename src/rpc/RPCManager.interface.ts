export type IPayload = any;

/**
 * Только собирает методы и вызывает их
 */
export interface IRPCManager {
    readonly availableMethods: string[];

    /**
     * Вызов метода
     * @param method
     * @param payload
     * @param session
     */
    call(method: string, payload: IPayload, session?: IPayload): IPayload;

    /**
     * Декодирование сырых данных вызова в параметры
     * @param payload
     */
    decode(payload: IPayload): IPayload;

    /**
     * Форматирование ответа метода
     * @param response
     */
    encode(response: IPayload): IPayload;
}

export interface RPCManagerOptions {
    unknownMethodHandler?: () => void; // TODO
}

export interface RPCControllerOptions {
    prefix: string
}
