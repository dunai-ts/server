import request from 'request';

/* tslint:disable */
export function fetch(method: string, url: string, body?: object): Promise<any> {
    return new Promise((resolve, reject) => {
        const params: any = {
            url,
            method,
        };

        if (body !== void 0) {
            params.body = body;
            params.json = true;
        }
        request(params, (error: any, _: any, body: any) => {
            console.log(error, body);
            return error ? reject(error) : resolve(body);
        });
    });
}
