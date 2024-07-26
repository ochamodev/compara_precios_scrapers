
import { chromium, Page } from "playwright";
import { config } from "./siman_config";
import { SimanProductUrlItem } from "./model/siman_product_url_item";
export class SimanScraper {
    async start() {
        const browser = await chromium.launch({headless: true});
        const page = await browser.newPage();
        const finalUrl = config.parentUrl + config.productCategories[0] + '?page=5';
        console.log("navigating to ", finalUrl);
        await page.goto(finalUrl);
        console.log("now in page ", finalUrl);

        const result = await this.checkIfOutItems(page);

        await page.waitForSelector(config.productContainerClass);
        
        // running on the browser, extracting links and product items:

        const productUrls: SimanProductUrlItem[] = await page.$$eval(config.productContainerClass, elements => {
            const urls = elements.map(it => {
                const url = it.querySelector('a')
                const simanProductUrlItem: SimanProductUrlItem = {
                    detailUrl: url ? url.href : ""
                };
                return simanProductUrlItem;
            });
            return urls;
        });
        console.log(productUrls);
    }

    async checkIfOutItems(page: Page): Promise<boolean>{
        const thereAreNoItems = await page.$$eval(config.noMoreItemsClass, elements => {
            const content = elements[0].textContent
            return content;
        });

        return false;
    }

}