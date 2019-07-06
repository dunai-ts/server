
export interface IPayload {
    [key: string | number]: any;
}

/**
 * Толбко собирает методы и вызывает их
 */
export interface IRPCManager {
    /**
     * Вызов метода
     * @param method
     * @param payload
     * @param session
     */
    call(method: string, payload: IPayload, session: IPayload): IPayload;

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
