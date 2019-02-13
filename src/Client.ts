/**
 * @module @dunai/server
 */

// import { Request, Response } from 'express';
// import url from 'url';
// import { IHeaders } from './Headers';
//
// export class Client {
//    public method: string;
//    public pathname: string;
//    public params: { [key: string]: string };
//    public query: { [key: string]: string };
//
//    public headers: IHeaders;
//
//    public rawRequest: () => Request;
//
//    public rawResponse: () => Response;
//
//    constructor(req: Request, res: Response) {
//        this.rawRequest = () => req;
//        this.rawResponse = () => res;
//
//        this.headers = req.headers;
//        this.method = req.method;
//
//        const urlInfo = url.parse(req.originalUrl);
//        this.pathname = urlInfo.pathname;
//        this.params = req.params;
//        this.query = req.query;
//    }
//
//    redirect(code?: number): void {
//
//    }
//
//    sendText(text: string): void {
//
//    }
//
//    json(data: object): void {
//
//    }
//
//    sendFile(path: string): void {
//
//    }
//
//    range(page: number, pages?: number): void {
//
//    }
// }
