import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { ProductModel } from "../common/core";
import { printProduct } from "../common/utils/scraping_utils";
import { config } from "./config";
import { Page } from "playwright";

export class KemikScraper {
  private category: string;

  constructor(category: string) {
    this.category = category;
  }

  public async scrape() { 
    // Use stealth plugin to avoid detection
    chromium.use(StealthPlugin());

    // Launch the browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the target URL
    await page.goto(`${config.base_url}${config.category_sub_path}${this.category}`);

    // Extract the product detail URLs
    const productDetailURLs = await this.extractDetailURL(page);

    // Extract the product details
    for (const productDetailPage of productDetailURLs) {
      await page.goto(productDetailPage, { waitUntil: "networkidle" });
      const product = await this.extractProductData(page, productDetailPage);
      printProduct(product);
    }

    // Close the browser
    await browser.close();
  }

  private async extractDetailURL(page: Page): Promise<string[]> {
    return await page
      .$$eval(config.grid_product_item_selector, (elements) => {
        return elements.map((element) => {
          const newElement = element as unknown as HTMLHyperlinkElementUtils;
          return newElement.href;
        });
      })
      .then((urls) => urls);
  }

  private async extractProductData(page: Page, productUrl: string): Promise<ProductModel> {
    return await page.evaluate(
      (data) => {
        const {
          brandSlector,
          imageSelector,
          modelSelector,
          skuSelector,
          currentPriceSelector,
          salePriceSelector,
          salePriceCentsSelector
        } = data.selectors;

        const priceRegex = /[^0-9.-]+/g;
        const name = document.querySelector(modelSelector)?.textContent;
        const brand = document.querySelector(brandSlector)?.querySelector("span")?.textContent;
        const image = document.querySelector(imageSelector)?.querySelector("img")?.getAttribute("src");
        const sku = document.querySelector(skuSelector)?.textContent;

        let currentPriceFloat = 0;
        let salePriceFloat = 0;
        const currentPriceElement = document.querySelector(currentPriceSelector);
        const salePriceElement = document.querySelector(salePriceSelector);
        const salePriceCentsElement = document.querySelector(salePriceCentsSelector);

        if (currentPriceElement) {
          const currentPriceString = currentPriceElement?.textContent;
          currentPriceFloat = currentPriceString ? parseFloat(currentPriceString.replace(priceRegex, "")) : 0;
          const salePriceString = salePriceElement?.querySelector("div")?.textContent;
          const salePriceCentsString = salePriceCentsElement?.textContent;
          const finalSalePriceString = `${salePriceString}.${salePriceCentsString}`;
          salePriceFloat = finalSalePriceString ? parseFloat(finalSalePriceString.replace(priceRegex, "")) : 0;
        } else {
          const currentPriceString = salePriceElement?.querySelector("div")?.textContent;
          const currentPriceCentsString = salePriceCentsElement?.textContent;
          const finalCurrentPriceString = `${currentPriceString}.${currentPriceCentsString}`;
          currentPriceFloat = finalCurrentPriceString ? parseFloat(finalCurrentPriceString.replace(priceRegex, "")) : 0;
          salePriceFloat = currentPriceFloat;
        }

        return {
          name: name ?? "",
          brandName: brand ?? "",
          productDetailUrl: data.productUrl,
          productImageUrl: image ?? "",
          productModel: name ?? "",
          storeSku: sku?.split("SKU: ")[1] ?? "",
          currentPrice: currentPriceFloat,
          salePrice: salePriceFloat,
        };
      },
      {
        selectors: {
          brandSlector: config.product_detail_brand_selector,
          imageSelector: config.product_detail_image_selector,
          modelSelector: config.product_detail_name_selector,
          skuSelector: config.product_detail_sku_selector,
          currentPriceSelector: config.product_detail_price_selector,
          salePriceSelector: config.product_detail_sale_price_selector,
          salePriceCentsSelector: config.product_detail_sale_price_cents_selector,
        },
        productUrl: productUrl
      }
    );
  }
}
