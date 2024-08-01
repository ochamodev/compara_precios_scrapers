import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { ProductModel } from "../common/core";
import { printProduct } from "../common/utils/scraping_utils";
import { config } from "./config";

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

    // Perform scraping actions here
    // For example, extract the title of the page
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Close the browser
    await browser.close();
  }
}
