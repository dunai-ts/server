import { Service } from '@dunai/core';
import { describe, it } from 'mocha';
import should from 'should';
import { Application, createApp } from './Application';

describe('Application decorator', () => {
    it('normal application', () => {
        @Application()
        class App {
            public someMethod(): boolean {
                return true;
            }
        }

        const app: any = createApp(App);

        should(app.someMethod()).ok();
    });
    it('decorated extends of decorated (inherit)', () => {
        @Application()
        class ParentApp {
            public someMethod(): boolean {
                return true;
            }
        }

        @Application()
        class App extends ParentApp {
            public anotherMethod(): boolean {
                return true;
            }
        }

        const app = createApp(App);

        const id1 = Reflect.getMetadata('instance_of', app);
        const id2 = Reflect.getMetadata('service_id', app);

        const id3 = Reflect.getMetadata('instance_of', App);
        const id4 = Reflect.getMetadata('service_id', App);

        const id5 = Reflect.getMetadata('instance_of', ParentApp);
        const id6 = Reflect.getMetadata('service_id', ParentApp);

        // console.log(id1, id2, id3, id4, id5, id6);

        should(app.someMethod()).ok();
        should(app.anotherMethod()).ok();

        should(id1).equal(id4);

        should(id1).ok();
        should(id2).undefined();
        should(id3).undefined();
        should(id4).ok();
        should(id5).undefined();
        should(id6).ok();
    });
    it('decorated extends of decorated (replaced)', () => {
        @Application()
        class ParentApp {
            public someMethod(): boolean {
                return false;
            }
        }

        @Application()
        class App extends ParentApp {
            public someMethod(): boolean {
                return true;
            }
        }

        const app = createApp(App);

        should(app.someMethod()).ok();
    });
    it('decorated extends of non decorated (inherit)', () => {
        class ParentApp {
            public someMethod(): boolean {
                return true;
            }
        }

        @Application()
        class App extends ParentApp {}

        const app = createApp(App);

        should(app.someMethod()).ok();
    });
    it('decorated extends of non decorated (replace method)', () => {
        class ParentApp {
            public someMethod(): boolean {
                return false;
            }
        }

        @Application()
        class App extends ParentApp {
            public someMethod(): boolean {
                return true;
            }
        }

        const app = createApp(App);

        should(app.someMethod()).ok();
    });
    it('no decorated extends of decorated', () => {
        @Service()
        class OtherService {

        }

        @Application()
        class ParentApp {
            public someMethod(): boolean {
                return true;
            }
        }

        class App extends ParentApp {
            constructor(public service?: OtherService) {
                super();
                should(service).not.ok();
            }
        }

        createApp(App);
    });
});
