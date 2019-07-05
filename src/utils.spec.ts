import request, { Response } from 'request';

/* tslint:disable */
export function fetch(
    method: string,
    url: string,
    body?: object,
    params: any = {}
): Promise<{
    status: number;
    statusText: string;
    body: any;
}> {
    return new Promise((resolve, reject) => {
        params.url    = url;
        params.method = method;

        if (body) {
            params.body = body;
            params.json = true;
        }
        request(params, (error: any, res: Response, body: any) => {
            try {
                body = JSON.parse(body);
            } catch (_) {}

            if (error)
                return reject(error);

            const result: any = {
                status    : res.statusCode,
                statusText: res.statusMessage,
                body
            };

            if (params.headers) {
                const headers = {};
                Object.keys(params.headers).forEach(
                    key => {
                        if (res.headers[key])
                            headers[key] = res.headers[key.toLowerCase()];
                    }
                );
                if (params.headers['Cookie'])
                    if (res.headers['set-cookie'])
                        headers['cookie'] = res.headers['set-cookie']
                        .map(item => item.split(';')[0])
                        .reduce(
                            (list, item) => {
                                const pair    = item.split('=');
                                list[pair[0]] = pair[1];
                                return list;
                            },
                            {}
                        );
                    else
                        headers['cookie'] = {};
                if (Object.keys(headers).length)
                    result.headers = headers;
            }

            //if (params.headers) {
            //    const headers = {};
            //    Object.keys(params.headers).forEach(
            //        key => {
            //            if (res.headers[key])
            //                headers[key] = res.headers[key.toLowerCase()];
            //        }
            //    );
            //    if (Object.keys(headers).length)
            //        result.headers = headers;
            //}

            return resolve(result);
        });
    });
}

export function sleep(timeout = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
