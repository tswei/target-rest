import express from 'express';
import * as database from './database';
import * as rx from 'rxjs'; 
import {first} from 'rxjs/operators';
import fetch from 'node-fetch';
import {Response} from 'node-fetch';
import bodyParser from 'body-parser';
import sanitize from 'mongo-sanitize';
import * as products from './products';

// create server and define constants
const app = express();
const port = process.env.PORT || 8000;
const defaultCurrencyCode = "USD";
// process.title = "expressServer";

// clear old values from database
database.resetDB(() => {}, true);

function externalRequest(id: number): rx.Subject<Response> {
    const result = new rx.AsyncSubject<Response>();
    const url = `http://redsky.target.com/v2/pdp/tcin/${id}`;
    rx.from(fetch(url)).pipe(first()).subscribe(res => {
        result.next(res)
        result.complete();
    })
    return result;
}

app.use('/', (req, res, next) => {
    if (req.method === 'GET' && req.accepts('json') !== 'json') {
        res.status(406);
        res.send();
    }
    else if (req.method === 'PUT' && req.is('json') !== 'json') {
        res.status(415);
        res.send();
    }
    else {
        next();
    }
})

app.use(bodyParser.json());

app.get(`/products/:id`, (req, res) => {
    const id = sanitize(req.params.id);
    externalRequest(id).subscribe(response => {
        res.status(response.status);
        // upstream server response did not show evidence of 300 status codes
        // no need to account for potential redirects
        if (response.status < 200 || response.status >= 300) {
            res.send({});
        }
        else {
            rx.from(response.json()).subscribe(json => {
                const extProduct = json.product;
                if (!products.isExternalProduct(extProduct)) {
                    res.send({});
                }
                else {
                    const defaultPrice: products.RetailPrice = {
                        value: extProduct.price.offerPrice.price,
                        currency_code: defaultCurrencyCode,
                    };

                    database.findOne(id, defaultPrice)
                        .pipe(first())
                        .subscribe(current_price => {
                            const body: products.RetailProduct = {
                                id: +id,
                                name: extProduct.item.product_description.title,
                                current_price,
                            };

                            res.send(body);
                        });
                }

            });
        }
    });
});

app.put(`/products/:id`, (req, res) => {
    const id = sanitize(req.params.id);
    const json = req.body;
    if (products.isRetailProduct(json)) {
        externalRequest(id)
            .subscribe(response => {
                // upstream server response did not show evidence of 300 status codes
                // no need to account for potential redirects
                if (response.status < 200 || response.status >= 300) {
                    res.status(409);
                    res.send("ID does not exist in resource");
                }
                else {
                    const retailPrice: products.RetailPrice = {
                        value: json.current_price.value,
                        currency_code: json.current_price.currency_code,
                    }
                    database.updateOne(id, retailPrice)
                        .subscribe(() => {
                            res.status(204);
                            res.send();
                    });
                }
            });
    }
    else {
        res.status(400);
        res.send("Incorrect JSON format");
    }
})

app.listen(port, () => console.log(`Express server listening on port ${port}`));
