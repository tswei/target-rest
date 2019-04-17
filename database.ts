import mongo from 'mongodb';
import * as rx from 'rxjs';
import {first} from 'rxjs/operators';
import {RetailPrice} from './products';

// convenience types
// type Query = {[key: string]: any};
// type Projection = {projection: {[key: string]: number}};

// static parameters (define at project level?)
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'target';
const collectionName = 'prices';

// instantiate the database connection as an Observable
const client = rx.bindNodeCallback(mongo.MongoClient.connect);
export const connection = client(mongoUrl);

// convenience function
const errorHandler = function(error: any) {
    if (error) {
        if (error.code != 26) {
            console.error(error);
        }
        return;
    }
}

// convenience wrapper for running functions to db
function accessDB(fn: (collection: mongo.Collection<any>) => void): void {
    connection
        .pipe(first())
        .subscribe(client => {
            const db = (client as mongo.MongoClient).db(dbName);
            const collection = db.collection(collectionName);
            fn(collection)
        }, errorHandler)
}

// drop collection to reset database
// used for testing and database initialization
export function resetDB(callback: () => any, verbose = false): void {
    let fn = function(collection: mongo.Collection<any>) {
        collection.drop()
            .then(() => {
                if (verbose) {
                    console.log(`collection ${collectionName} deleted`)
                }
            })
            .catch(errorHandler)
            .finally(callback());
    }
    accessDB(fn);
}

// find complete record for one
export function findOne(id: string, defaultValue: RetailPrice): rx.Subject<RetailPrice> {
    const result = new rx.AsyncSubject<RetailPrice>();

    let queryFn = function(collection: mongo.Collection<any>) {
        collection.findOne({_id: id}, (err, res) => {
            if (err) {
                console.error(err);
                return;
            }
            if (res == null) {
                updateOne(id, defaultValue).subscribe(value => {
                    result.next(value);
                    result.complete();
                });
            }
            else {
                result.next(res.current_price);
                result.complete();
            }
        });
    };

    accessDB(queryFn);
    return result;
}

// update a record for one
export function updateOne(id: string, update: RetailPrice): rx.Subject<RetailPrice> {
    const result = new rx.AsyncSubject<RetailPrice>();

    let queryFn = function(collection: mongo.Collection<any>) {
        const insert = {_id: id, current_price: update};
        collection.findOneAndReplace({_id: id}, insert, {upsert: true, returnOriginal: false}, (err, res) => {
            if (err) {
                console.error(err);
                return;
            }
            result.next(res.value.current_price);
            result.complete();
        });
    };

    accessDB(queryFn);
    return result;
}
