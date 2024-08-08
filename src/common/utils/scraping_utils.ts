import { ProductModel } from "../core";
import { Page } from "playwright";

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

export async function humanLikeMouseMovement(
  page: Page,
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  await page.mouse.move(startX, startY);
  await page.waitForTimeout(100 + Math.random() * 100); // Add some randomness in the movement
  await page.mouse.move(endX, endY, { steps: 5 + Math.random() * 5 });
}
