import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { SessionData } from './Session';

export interface Request extends ExpressRequest {
    session_id?: string;
    session?: any;
}

// tslint:disable-next-line
export interface Response extends ExpressResponse {
    session_id?: string;
    session?: SessionData;
}
