import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { ProductModel } from "../common/core";
import { printProduct } from "../common/utils/scraping_utils";
import { config } from "./config";
import { Page } from "playwright";
import { url } from "inspector";

export class KemikScraper {
  constructor() {
    console.log("KemikScraper constructor");
  }

  public async scrape() {
    console.log("KemikScraper scrape");

    // Use stealth plugin to avoid detection
    chromium.use(StealthPlugin());

    // Launch the browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the target URL
    await page.goto(
      `${config.base_url}${config.category_sub_path}${config.category_paths[0]}`
    );

    const detailURLs = await this.extractDetailURL(page);

    // Close the browser
    await browser.close();
  }

  private async extractDetailURL(page: Page): Promise<string[]> {
    return await page
      .$$eval(config.product_item_selector, (elements) => {
        return elements.map((element) => {
          const newElement = element as unknown as HTMLHyperlinkElementUtils;
          return newElement.href;
        });
      })
      .then((urls) => {
        console.log("Detail URLs", urls);
        return urls;
      })
      .catch((err) => {
        console.log("Error extracting detail URLs", err);
        return [];
      });
  }

  private async extractProductData(page: any) {}
}
