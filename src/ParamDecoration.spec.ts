import { describe, it } from 'mocha';
import should from 'should';
import { Controller } from './controller/Controller';
import { addControllerParamDecoration, getControllerMetadata, runMethod } from './ParamDecoration';

describe('Controller', () => {
    describe('Param decorations', () => {
        function Value() {
            return addControllerParamDecoration({
                type       : 'value',
                useFunction: (data: { value: number }) => {
                    return data.value;
                }
            });
        }

        function Increase(inc = 1) {
            return addControllerParamDecoration({
                type       : 'increase',
                useFunction: (_, value) => {
                    return value + inc;
                }
            });
        }

        describe('get value', () => {
            it('get value', () => {
                @Controller()
                class TestCtrl {
                    public one(@Value() num: number) {
                        return num;
                    }
                }

                const test = new TestCtrl();
                const result = runMethod(test, 'one')({ value: 10 });
                should(result).eql(10);

                const test2 = new TestCtrl();
                const result2 = runMethod(test2, 'one')({ value: 20 });
                should(result2).eql(20);
            });
        });

        describe('default value', () => {
            it('default value 1', () => {
                @Controller()
                class DefaultCtrl {
                    public one(req: string) {
                        return req;
                    }
                }

                const test = new DefaultCtrl();
                const proto = getControllerMetadata(test as any);

                const result = runMethod(test, 'one')(null);
                should(result).undefined();

                const test2 = new DefaultCtrl();
                const result2 = runMethod(test2, 'one')(null, 'req');
                should(result2).eql('req');
            });
            it('default value 2', () => {
                @Controller()
                class TestCtrl {
                    public one(req: string, @Value() num: number) {
                        return { req, num };
                    }
                }

                const test2 = new TestCtrl();
                const result2 = runMethod(test2, 'one')({ value: 20 });
                should(result2).eql({ req: undefined, num: 20 });

                const test = new TestCtrl();
                const result = runMethod(test, 'one')({ value: 10 }, 'req');
                should(result).eql({ req: 'req', num: 10 });
            });
        });

        describe('base decorators', () => {
            it('base decorators', () => {
                @Controller()
                class TestCtrl {
                    public one(@Increase() @Value() num: number) {
                        return num;
                    }

                    public action(@Increase(5) @Value() num: number) {
                        return num;
                    }
                }

                const test = new TestCtrl();
                const result = runMethod(test, 'one')({ value: 1 });
                should(result).eql(2);

                const test2 = new TestCtrl();
                const result2 = runMethod(test2, 'one')({ value: 2 });
                should(result2).eql(3);

                const test3 = new TestCtrl();
                const result3 = runMethod(test3, 'action')({ value: 1 });
                should(result3).eql(6);

                const test4 = new TestCtrl();
                const result4 = runMethod(test4, 'action')({ value: 20 });
                should(result4).eql(25);
            });

            it('bad order of decorators 2', () => {
                @Controller()
                class TestCtrl2 {
                    public one(@Increase(5) num: number) {
                        return num;
                    }

                    public action(@Value() @Increase(5) num: number) {
                        return num;
                    }
                }

                const test2 = new TestCtrl2();
                const result2 = runMethod(test2, 'one')({ value: 15 });
                should(result2).NaN();

                const test3 = new TestCtrl2();
                const result3 = runMethod(test3, 'action')({ value: 15 });
                should(result3).eql(15);

                const test4 = new TestCtrl2();
                const result4 = runMethod(test4, 'action')({ value: 25 });
                should(result4).eql(25);
            });
        });
    });
});
