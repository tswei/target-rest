import {expect} from 'chai';
import request from 'request';
import assert from 'assert';
import * as database from '../database';
import mongo from 'mongodb';

const port = 8000;
function localserver(path: string): string {
    return `http://localhost:${port}/${path}`
}

const bodySuccess = {
    id: 13860428,
    name: "The Big Lebowski (Blu-ray)",
    current_price: {
        value: 14.99,
        currency_code: "USD"
    }
}

after('close DB connection', done => {
    console.log('closing connection');
    database.connection.subscribe(client => {
        (client as mongo.MongoClient).close();
        done();
    });
});

describe('GET', () => {
    describe('success', () => {
        it('should return 200 and correct object', done => {
            request(localserver('products/13860428'), (_err, res, body) => {
                assert.equal(res.statusCode, 200);
                expect(body).to.equal(JSON.stringify(bodySuccess));
                done();
            });
        });
    });

    describe('failure', () => {
        it('should return 404 and empty object if not valid id', done => {
            request(localserver('products/138604287'), (_err, res, body) => {
                assert.equal(res.statusCode, 404);
                expect(body).to.equal(JSON.stringify({}));
                done();
            });
        });

        it('should return 406 and no body if not valid Accept header', done => {
            let options = {
                url: localserver('products/13860428'),
                headers: {
                    "Accept": "text/xml",
                },
            };
            request(options, (_err, res, body) => {
                assert.equal(res.statusCode, 406);
                expect(body).to.equal('');
                done();
            });
        });
    });
});

describe('PUT', () => {
    beforeEach('reset database', done => {
        database.resetDB(done);
    });

    describe('success', () => {
        it('should return 204 and set pricing data', done => {
            let body = JSON.parse(JSON.stringify(bodySuccess));
            body.current_price.value = 9.99;
            body.current_price.currency_code = "EUR";
            let url = localserver('products/13860428');

            let options = {
                method: 'put',
                body,
                json: true,
                url,
            }
            request(options, (_err, res, resBody) => {
                assert.equal(res.statusCode, 204);
                expect(resBody).to.equal(undefined);

                request(url, (_err, res, getBody) => {
                    assert.equal(res.statusCode, 200);
                    expect(getBody).to.equal(JSON.stringify(body));
                    done();
                });
            });
        });
    });

    describe('failure', () => {
        it('should return 415 and no body if not valid Content-Type header', done => {
            let url = localserver('products/13860428');

            let options = {
                method: 'put',
                body: "bad upload",
                headers: {
                    'Content-Type': 'text/plain',
                },
                url,
            }
            request(options, (_err, res, _body) => {
                assert.equal(res.statusCode, 415);
                
                request(url, (_err, res, getBody) => {
                    assert.equal(res.statusCode, 200);
                    expect(getBody).to.equal(JSON.stringify(bodySuccess));
                    done();
                })
            })
        });

        it('should return 409 if not valid id', done => {
            let body = JSON.parse(JSON.stringify(bodySuccess));
            body.current_price.value = 9.99;
            body.current_price.currency_code = "EUR";
            let url = localserver('products/138604287');

            let options = {
                method: 'put',
                body,
                json: true,
                url,
            }

            request(options, (_err, res, _body) => {
                assert.equal(res.statusCode, 409);
                
                request(url, (_err, res, getBody) => {
                    assert.equal(res.statusCode, 404);
                    expect(getBody).to.equal(JSON.stringify({}));
                    done()
                });
            });
        });

        it('should return 400 if body does not contain pricing', done => {
            let body = JSON.parse(JSON.stringify(bodySuccess));
            body.current_price.value = undefined;
            body.current_price.currency_code = undefined;
            let url = localserver('products/13860428');

            let options = {
                method: 'put',
                body,
                json: true,
                url,
            }

            request(options, (_err, res, _body) => {
                assert.equal(res.statusCode, 400);
                
                request(url, (_err, res, getBody) => {
                    assert.equal(res.statusCode, 200);
                    expect(getBody).to.equal(JSON.stringify(bodySuccess));
                    done()
                });
            });
        });
    });
});
