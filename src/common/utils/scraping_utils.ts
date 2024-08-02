import { ProductModel } from "../core";

export function printProduct(product: ProductModel) {
  console.log(`------- product data -------
name: ${product.name}
link: ${product.productDetailUrl}
brand: ${product.brandName}
SKU: ${product.storeSku}
image: ${product.productImageUrl}
current-price: ${product.currentPrice}
sale-price: ${product.salePrice}
----------------------------`);
}
