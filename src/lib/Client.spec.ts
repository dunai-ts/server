import { Application, Request, Response } from 'express';
import express from 'express';
import * as http from 'http';
import { describe, it } from 'mocha';
import should from 'should';
import { Client } from './Client';
import { fetch } from './utils.spec';
import { IHeaders } from './Headers';


let app: Application;
let server: http.Server;

let callback: (req: Request, res: Response) => void;

describe('Client service', () => {
    beforeEach(() => {
        app = express();
        app.all('/some/:id', (req, res) => callback(req, res));
        server = app.listen(3000);
    });

    afterEach(() => {
        server.close();
    });

    describe('base client information', () => {
        it('standart', (done) => {
            callback = (req, res) => {
                console.log(req);
                const client = new Client(req, res);
                should(client).instanceOf(Client);
                should(client.rawRequest()).equal(req);
                should(client.rawResponse()).equal(res);

                should(client.method).equal('PUT');
                should(client.pathname).equal('/some/path');
                should(client.params).eql({
                    id: 'path'
                });
                should(client.query).eql({
                    get1: 'asdfa',
                    get2: 'cvbcvbn'
                });

                should(client.headers).equal({
                    host: 'localhost:3000'
                });

                res.json({});
            };
            fetch('put', 'http://localhost:3000/some/path?get1=asdfa&get2=cvbcvbn').then(() => done());
        });
    });

    describe('json', () => {
        it('req', (done) => {
            callback = (req, res) => {
                console.log(req);
                const client = new Client(req, res);
                should(client).instanceOf(Client);
                should(client.rawRequest()).equal(req);
                should(client.rawResponse()).equal(res);

                should(client.method).equal('PUT');
                should(client.pathname).equal('/some/path');
                should(client.params).eql({
                    id: 'path'
                });
                should(client.query).eql({
                    get1: 'asdfa',
                    get2: 'cvbcvbn'
                });

                should(client.headers).equal({
                    host: 'localhost:3000'
                });

                req.res.json({});
            };
            fetch('put', 'http://localhost:3000/some/path?get1=asdfa&get2=cvbcvbn').then(() => done());
        });
    });
    describe('redirect', () => {
        it('???', () => {

        });
    });
    describe('sendText', () => {
        it('???', () => {

        });
    });
    describe('sendFile', () => {
        it('???', () => {

        });
    });
    describe('page', () => {
        it('???', () => {

        });
    });
});
