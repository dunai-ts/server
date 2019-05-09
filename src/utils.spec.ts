import { describe, it } from 'mocha';
import should from 'should';
import request from 'request';
import { Response } from 'request';
import { deepFreeze } from './utils';

/* tslint:disable */
export function fetch(
    method: string,
    url: string,
    body?: object,
    params: any = {}
): Promise<any> {
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
                status: res.statusCode,
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

describe('utils', () => {
    describe('freeze', () => {
        it('eql', () => {
            const obj = {
                foo: 'bar'
            };
            const ret = deepFreeze(obj);

            should(ret).equal(obj);
        });
    });
});
