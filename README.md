# myRetail RESTful Service

## Project Description

Create an end-to-end Proof-of-Concept for a products API, which will aggregate product data from multiple sources and return it as JSON to the caller.

### Background

myRetail is a rapidly growing company with HQ in Richmond, VA and over 200 stores across the east coast. myRetail wants to make its internal data available to any number of client devices, from myRetail.com to native mobile apps.

The goal is to create a RESTful service that can retrieve product and price details by ID. The URL structure has yet to be defined, but must follow a logical convention.

### Requirements

- Responds to an HTTP GET request at `/products/{id}` and delivers product data as JSON (where {id} will be a number)
  - Example product IDs: 15117729, 16483589, 16696652, 16752456, 15643793
  - Example response: `{"id": 13860428, "name": "The Big Lebowski (Blu-ray) (Widescreen)", "current_price": {"value": 13.49, "currency_code": "USD"}}`
- Performs an HTTP GET to retrieve the product name from an external API. (For this exercise the data will come from redsky.target.com, but let's just pretend this is an internal resource hosted by myRetail)
  - Example: [redsky.target.com](http://redsky.target.com/v2/pdp/tcin/13860428?excludes=taxonomy,price,promotion,bulk_ship,rating_and_review_reviews,rating_and_review_statistics,question_answer_statistics)
- Reads pricing information from a NoSQL data store and combines it with the product id and name from the HTTP request into a single response
- **BONUS**: Accepts an HTTP PUT request at the same path (`/products/{id}`), containing a JSON request body similar to the GET response, and update the product's price in the data store

## Project Instructions

### Setup

- setup [mongoDB server](https://www.mongodb.com/download-center/community) local machine
  - this project used version 4.0.6, but the latest 4.0.x release should still work
- change mongodb port numbers in `root/database.ts` if not using default
- install [node v11.0.0](https://nodejs.org/download/release/v11.0.0/)
- install necessary packages: `npm install` for `root/package.json`

### Running

- start mongodb
- start express server in root directory: `npm start`
- make requests at localhost:8000

### Testing

- start mongodb
- start express server in root directory: `npm start`
- run tests: `npm test`

### Shutting Down

- find the PID and kill it

## Notes

- _add project notes_
