import { ProductModel } from "../core";

export function printProduct(product: ProductModel) {
    console.log(`
    ------- Product Data -------
    Product Name: ${product.name}
    Product Link: ${product.productDetailUrl}
    Product Image: ${product.productImageUrl}
    Product Brand: ${product.brandName}
    Product Sku: ${product.storeSku}
    Product Model: ${product.productModel}
    Product sale price: ${product.salePrice}
    Product current price: ${product.currentPrice}
    ----------------------------
    `);
}
