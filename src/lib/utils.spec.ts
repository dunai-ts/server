import request from 'request';

/* tslint:disable */
export function fetch(
    method: string,
    url: string,
    body?: object
): Promise<any> {
    return new Promise((resolve, reject) => {
        const params: any = {
            url,
            method
        };

        if (body !== void 0) {
            params.body = body;
            params.json = true;
        }
        request(params, (error: any, res: any, body: any) => {
            try {
                body = JSON.parse(body);
            } catch (_) {}

            return error
                ? reject(error)
                : resolve({
                      status: res.statusCode,
                      body
                  });
        });
    });
}
