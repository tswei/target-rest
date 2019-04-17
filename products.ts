export interface ExternalPrice {
    offerPrice: {
        price: number,
        [x: string]: any,
    };
}

export interface Item {
    product_description: {
        title: string,
        [x: string]: any,
    };
    [x: string]: any;
}

export interface ExternalProduct {
    price: ExternalPrice;
    item: Item;
    [x: string]: any;
}

export interface ProductResponse {
    product: ExternalProduct;
}

export function isExternalProduct(json: any): json is ExternalProduct {
    const product = (json as ExternalProduct);
    const hasName = product 
        && product.item
        && product.item.product_description
        && product.item.product_description.title !== undefined;
    const hasPrice = product
        && product.price
        && product.price.offerPrice
        && product.price.offerPrice.price !== undefined;
    return hasName && hasPrice;
}

export interface RetailPrice {
    value: number;
    currency_code: string;
}

export interface RetailProduct {
    id: number;
    name: string;
    current_price: RetailPrice;
}

export function isRetailProduct(json: any): json is RetailProduct {
    const priceObj = (json as RetailProduct).current_price;
    return priceObj && priceObj.value !== undefined && priceObj.currency_code !== undefined;
}
