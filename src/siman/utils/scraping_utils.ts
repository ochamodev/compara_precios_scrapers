import { Page } from "playwright";
import { config } from "../siman_config";

export function getProductSku(link: String | null) {
    if (!link) {
        throw new Error("Link is null");
    }
    const tokens = link.split('-');
    const skuPart = tokens[tokens.length - 1].split('/')[0];
    return skuPart;
}

export async function humanLikeMouseMovement(page: Page, startX : any, startY : any, endX : any, endY : any) {
    await page.mouse.move(startX, startY);
    await page.waitForTimeout(100 + Math.random() * 100); // Add some randomness in the movement
    await page.mouse.wheel(100 + Math.random(), 1000);
    await page.mouse.move(endX, endY, { steps: 5 + Math.random() * 5 });
}


export async function isProductListEmpty(page: Page): Promise<boolean>{
    const thereAreNoItems = await page.$$eval(config.noMoreItemsClass, elements => {
        const content = elements[0].textContent
        return content;
    });
    if (thereAreNoItems?.includes("No pudimos encontrar lo que estabas buscando")) {
        return true;
    }
    return false;
}

export async function takeScreenshot(page: Page, pageName: string) {
    await page.screenshot({path: pageName, fullPage: true})
}
