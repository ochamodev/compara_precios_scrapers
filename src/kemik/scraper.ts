import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { ProductModel } from "../common/core";
import { printProduct } from "../common/utils/scraping_utils";
import { config } from "./config";
import { Page } from "playwright";

export class KemikScraper {
  private category: string;
  private pageNumber: number = 1;

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
    let productDetailURLs: string[] = [];

    // Navigate to the target URL
    await page.goto(
      `${config.base_url}${config.category_sub_path}${this.category}`
    );

    // Get the number of pages (pagination)
    const totalPages = await this.getTotalPages(page);

    while (this.pageNumber <= totalPages) {
      if (this.pageNumber > 1) {
        await page.goto(`${config.base_url}${config.category_sub_path}${this.category}?page=${this.pageNumber}`);
      }

      // Extract the product detail URLs
      const newProductDetailURLs = await this.extractDetailURL(page);
      productDetailURLs.push(...newProductDetailURLs);

      this.pageNumber++;
    }

    // Extract the product details
    for (const productDetailPage of productDetailURLs) {
      console.log(`Extracting product details from: ${productDetailPage}`);
      await page.goto(productDetailPage, { waitUntil: "networkidle" });
      const product = await this.extractProductData(page, productDetailPage);
      printProduct(product);
    }

    // Close page and browser
    await page.close();
    await browser.close();
  }

  private async getTotalPages(page: Page): Promise<number> {
    return await page
      .$$eval(config.pagination_button_selector_class, (elements) => {
        return elements.map(
          (element) => element.textContent as unknown as number
        );
      })
      .then((data) => data[data.length - 1]);
  }

  private async extractDetailURL(page: Page): Promise<string[]> {
    return await page
      .$$eval(config.grid_product_item_selector_class, (elements) => {
        return elements.map((element) => {
          const newElement = element as unknown as HTMLHyperlinkElementUtils;
          return newElement.href;
        });
      })
      .catch((error) => {
        console.error("Error extracting product URLs: ", error);
        return [];
      });
  }

  private async extractProductData(page: Page,productUrl: string): Promise<ProductModel> {
    return await page
      .evaluate(
        (data) => {
          const {
            brandSelectorClass,
            imageSelectorClass,
            modelSelectorClass,
            skuSelectorClass,
            currentPriceSelectorClass,
            salePriceSelectorClass,
            salePriceCentsSelectorClass,
          } = data.selectors;

          const priceRegex = /[^0-9.-]+/g;
          const name = document.querySelector(modelSelectorClass)?.textContent;
          const brand = document.querySelector(brandSelectorClass)?.querySelector("span")?.textContent;
          const image = document.querySelector(imageSelectorClass)?.querySelector("img")?.getAttribute("src");
          const sku = document.querySelector(skuSelectorClass)?.textContent;

          let currentPrice = 0;
          let salePrice: number | null = null;
          const currentPriceElement = document.querySelector(currentPriceSelectorClass);
          const salePriceElement = document.querySelector(salePriceSelectorClass)?.querySelector("div");
          const salePriceCentsElement = document.querySelector(salePriceCentsSelectorClass);

          if (currentPriceElement) {
            const currentPriceString = currentPriceElement?.textContent;
            currentPrice = currentPriceString ? parseFloat(currentPriceString.replace(priceRegex, "")) : 0;
            const salePriceString = salePriceElement?.textContent;
            const salePriceCentsString = salePriceCentsElement?.textContent;
            const finalSalePriceString = `${salePriceString}.${salePriceCentsString}`;
            salePrice = finalSalePriceString ? parseFloat(finalSalePriceString.replace(priceRegex, "")) : 0;
          } else {
            const currentPriceString = salePriceElement?.textContent;
            const currentPriceCentsString = salePriceCentsElement?.textContent;
            const finalCurrentPriceString = `${currentPriceString}.${currentPriceCentsString}`;
            currentPrice = finalCurrentPriceString ? parseFloat(finalCurrentPriceString.replace(priceRegex, "")) : 0;
            salePrice = null;
          }

          return {
            name: name ?? "",
            brandName: brand ?? "",
            productDetailUrl: data.productUrl,
            productImageUrl: image ?? "",
            productModel: name ?? "",
            storeSku: sku?.split("SKU: ")[1] ?? "",
            currentPrice: currentPrice,
            salePrice: salePrice,
          };
        },
        {
          selectors: {
            brandSelectorClass: config.product_detail_brand_selector_class,
            imageSelectorClass: config.product_detail_image_selector_class,
            modelSelectorClass: config.product_detail_name_selector_class,
            skuSelectorClass: config.product_detail_sku_selector_class,
            currentPriceSelectorClass: config.product_detail_price_selector_class,
            salePriceSelectorClass: config.product_detail_sale_price_selector_class,
            salePriceCentsSelectorClass: config.product_detail_sale_price_cents_selector_class,
          },
          productUrl: productUrl,
        }
      )
      .catch((error) => {
        console.error("Error extracting product data: ", error);
        return {} as ProductModel;
      });
  }
}
