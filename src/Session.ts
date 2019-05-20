import { Service } from '@dunai/core';
import { changeHeadersBeforeSendMiddleware } from './Headers';

/**
 * @module @dunai/server
 */
import { Map } from 'immutable';
import { Request, Response } from './Interfaces';

export function sessionFromHeader(header = 'Authorization', tokenType = 'Bearer') {
    return (req: Request, res: Response, next: any) => {
        req.session_id = req.header(header);
        /* tslint:disable-next-line */
        if (req.session_id.substr(0, tokenType.length + 1) === tokenType + ' ')
            req.session_id = req.session_id.substr(tokenType.length + 1).trim();
        else
            req.session_id = null;

        next();
    };
}

export function sessionFromCookie(
    cookie = 'session',
    options: {
        maxAge: number;
        httpOnly: boolean;
        secure: boolean
    }      = {
        maxAge  : 86400 * 1000, // 24 hours
        httpOnly: true, // http only, prevents JavaScript cookie access
        secure  : true
    }) {
    return [
        (req: Request, res: Response, next: any) => {
            req.session_id   = req.cookies[cookie];
            next();
        },
        changeHeadersBeforeSendMiddleware(
            (req: Request, res: Response) => {
                if (req.session_id !== res.session_id)
                    res.cookie(cookie, res.session_id, options);
            }
        )
    ];
}

export interface ISessionStorage {
    get(sessionKey: string): object;
    set(sessionKey: string, session: object, lastSession?: object): void;
}

@Service()
export class SessionStorageInMemory implements ISessionStorage {
    public storage: {
        [key: string]: object
    } = {};

    public get(sessionKey: string): object {
        return this.storage[sessionKey] || {};
    }
    public set(sessionKey: string, session: object): void {
        this.storage[sessionKey] = session;
    }
}

export class SessionData {
    private data: Map<string, any> = null;
    constructor(data: object) {
        /* tslint:disable-next-line */
        if (typeof data === 'object')
            this.data = Map<any>(data);
        else
            this.data = Map<string, any>();
    }
    public has(key: string): boolean {
        return this.data.has(key);
    }
    public get(key: string): any {
        return this.data.get(key);
    }
    public set(value: any);
    public set(key: string, value: any);
    public set(key: string | any, value?: any): SessionData {
        if (value === void 0)
            this.data = Map(key);
        else
            this.data = this.data.set(key, value);
        return this;
    }
    public delete(key: string): SessionData {
        this.data = this.data.delete(key);
        return this;
    }
    public deleteAll(keys: Iterable<string>): SessionData {
        this.data = this.data.deleteAll(keys);
        return this;
    }
    public clear(): SessionData {
        this.data = this.data.clear();
        return this;
    }
    public getData(): object {
        return this.data.toJS();
    }
}
