import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export interface Request<R, S> extends ExpressRequest {
    session_id?: string;
    session?: S;
}
