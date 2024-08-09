import { Page } from "playwright";
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


export function logExecutionTime(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
}

export async function humanLikeMouseMovement(page: Page, startX : any, startY : any, endX : any, endY : any) {
    await page.mouse.move(startX, startY);
    await page.waitForTimeout(100 + Math.random() * 100); // Add some randomness in the movement
    await page.mouse.wheel(100 + Math.random(), 1000);
    await page.mouse.move(endX, endY, { steps: 5 + Math.random() * 5 });
}
