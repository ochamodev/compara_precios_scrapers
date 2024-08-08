import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { PacifikoConfig } from "./config";
import { Page } from "playwright";
import { printProduct } from "../common/utils/scraping_utils";
import { ProductModel } from "../common/core";

export class PacifikoScraper {
  private routes: string[];

  constructor(routes: string[]) {
    this.routes = routes;
  }

  public async scrape() {
    // Use stealth plugin to avoid detection
    chromium.use(StealthPlugin());

    const browser = await chromium.launch({
      headless: true,
    });
    const context = await browser.newContext();
    // init script
    await context.addInitScript(
      "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    );
    const page = await context.newPage();

    // List of all product details URLs
    const productDetailURLs: (string | null)[] = [];

    for (const route of this.routes) {
      let pageNum = 1;
      // Navigating to the first route page=1
      const categoryUrl = PacifikoConfig.parentUrl.concat(
        route,
        `&page=${pageNum}`
      );

      await page.goto(categoryUrl, {
        waitUntil: "networkidle",
      });

      const totalOfPages = await this.extractTotalOfPages(page);

      for (pageNum; pageNum <= totalOfPages; pageNum++) {
        if (pageNum > 1) {
          await page.goto(
            PacifikoConfig.parentUrl.concat(route, `&page=${pageNum}`)
          );

          const newProductDetailsURLs = await this.extractProductURLs(page);
          productDetailURLs.push(...newProductDetailsURLs);
        }
      }

      for (const productDetailPage of productDetailURLs) {
        if (productDetailPage) {
          await page.goto(`${PacifikoConfig.parentUrl}${productDetailPage}`, {
            waitUntil: "networkidle",
          });
          const product = await this.extractProductData(
            page,
            productDetailPage
          );
          printProduct(product);
        }
      }
    }

    await page.close();
    await browser.close();
  }

  private async extractTotalOfPages(page: Page): Promise<number> {
    return await page
      .evaluate(() => {
        const paginationList: NodeListOf<Element> = document.querySelectorAll(
          "#filterPanel-1 .pagination li"
        );

        const lastPage =
          paginationList.length > 1
            ? paginationList[paginationList.length - 1]
                ?.querySelector("a")
                ?.getAttribute("href")
                ?.match(/[?&]page=([0-9]+)/)?.[1]
            : "1";

        return Number(lastPage ?? 1);
      })
      .catch((error) => {
        console.error("Error extracting total of pages: ", error);
        return 1;
      });
  }

  private async extractProductURLs(page: Page): Promise<(string | null)[]> {
    return await page
      .evaluate(
        ({ selectors }) => {
          const products =
            document.querySelectorAll(selectors.productContainerClass) ?? [];

          const productURLs =
            Array.from(products ?? []).map((product) => {
              return (
                product.querySelector("a")?.getAttribute("href")?.trim() ?? null
              );
            }) ?? [];

          return productURLs;
        },
        {
          selectors: {
            productContainerClass: PacifikoConfig.productContainerClass,
          },
        }
      )
      .catch((error) => {
        console.error("Error extracting product urls: ", error);
        return [];
      });
  }

  private async extractProductData(
    page: Page,
    productURL: string
  ): Promise<ProductModel> {
    return await page
      .evaluate(
        ({ selectors, productData }) => {
          // product name
          const name =
            document.querySelector(selectors.nameSelectorClass)?.textContent ??
            "";
          // product brand
          const brandName =
            document
              .querySelector(selectors.brandSelectorClass)
              ?.getAttribute("href") ?? "";
          // product image url
          const productImageUrl =
            document
              .querySelector(selectors.imageSelectorClass)
              ?.getAttribute("src") ?? "";

          // current and sale prices
          const price =
            document
              .querySelector(selectors.priceSelectorClass)
              ?.textContent?.replace(/[^0-9.]/g, "") ?? "0";
          const priceOld = document
            .querySelector(selectors.priceOldSelectorClass)
            ?.textContent?.replace(/[^0-9.]/g, "");
          const sale = document.querySelector(selectors.saleSelectorClass);
          const currentPrice = sale ? priceOld : price;
          const salePrice = sale ? Number(price) : null;

          // stoke sku/pid - extracted from url
          const pid = productData.productURL.match(/pid=([^&]*)/)?.[1] ?? null;

          // product model - extracted from table of details
          let productModel = null;
          const rows = document.querySelectorAll(
            selectors.productModelSelectorClass
          );
          if (rows && rows.length) {
            for (const row of rows) {
              // Get the title cell in the current row
              const titleCell = row.querySelector(
                selectors.productModelCellSelectorClass
              );

              // Check if the title cell contains "número de modelo"
              if (
                titleCell &&
                titleCell?.textContent?.trim().toLowerCase() ===
                  selectors.productModelText
              ) {
                // Get the value cell in the same row
                const valueCell = row.querySelector(
                  selectors.productModelCellValueSelectorClass
                );

                if (valueCell) {
                  productModel = valueCell?.textContent?.trim() ?? null;
                  console.log(productModel); // Outputs: ASDFAXASDFA
                  break;
                }
              }
            }
          }

          return {
            name,
            brandName,
            productDetailUrl: productData.productURL,
            productImageUrl,
            productModel: productModel,
            storeSku: pid,
            currentPrice: Number(currentPrice),
            salePrice: salePrice,
          };
        },
        {
          selectors: {
            nameSelectorClass: PacifikoConfig.nameSelectorClass,
            brandSelectorClass: PacifikoConfig.brandSelectorClass,
            imageSelectorClass: PacifikoConfig.imageSelectorClass,
            priceSelectorClass: PacifikoConfig.priceSelectorClass,
            priceOldSelectorClass: PacifikoConfig.priceOldSelectorClass,
            saleSelectorClass: PacifikoConfig.saleSelectorClass,
            productModelSelectorClass: PacifikoConfig.productModelSelectorClass,
            productModelText: PacifikoConfig.productModelText,
            productModelCellSelectorClass:
              PacifikoConfig.productModelCellSelectorClass,
            productModelCellValueSelectorClass:
              PacifikoConfig.productModelCellValueSelectorClass,
          },
          productData: {
            productURL,
          },
        }
      )
      .catch((error) => {
        console.error("Error extracting product data: ", error);
        return {} as ProductModel;
      });
  }
}
