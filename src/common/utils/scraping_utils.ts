import { ProductModel } from "../core";

export function printProduct(product: ProductModel) {
    console.log('------- Product Data -------')
    console.log(`Product Name: ${product.name}`);
    console.log(`Product Link: ${product.productDetailUrl}`);
    console.log(`Product Brand: ${product.brandName}`);
    console.log(`Product Sku: ${product.storeSku}`);
    console.log('----------------------------')
}
