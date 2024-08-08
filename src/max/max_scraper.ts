import { firefox } from "playwright-extra";
import { Page } from "playwright";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { ProductModel } from "../common/core";
import { MaxConfig } from "./max_config";
import {
  humanLikeMouseMovement,
  printProduct,
} from "../common/utils/scraping_utils";

export class MaxScraper {
  async start() {
    // Use stealth plugin to avoid detection
    firefox.use(StealthPlugin());

    // Launch the browser
    const browser = await firefox.launch({
      headless: true,
    });
    const page = await browser.newPage();

    for (const category of MaxConfig.productCategories) {
      let pageNum = 0;

      while (true) {
        const finalUrl = MaxConfig.parentUrl.concat(category, `?p=${pageNum}`);

        await page.goto(finalUrl, {
          waitUntil: "networkidle",
        });

        console.log("now in page ", finalUrl);

        await humanLikeMouseMovement(page, 100, 100, 400, 400);

        const isListEmpty = await this.isProductListEmpty(page);

        if (isListEmpty) {
          console.log("Page", pageNum, "is empty");

          break;
        }

        // running on the browser, extracting links and product items:
        const productUrls = await this.getUrlsPerPage(page);

        await this.extractProductData(page, productUrls);

        pageNum++;
      }
    }

    await page.close();
    await browser.close();
  }

  async isProductListEmpty(page: Page): Promise<boolean> {
    return !!(await page.evaluate(() => {
      return document.querySelector(".message.info.empty");
    }));
  }

  private async getUrlsPerPage(page: Page): Promise<string[]> {
    return await page.evaluate(
      (data) => {
        const products: string[] = [];
        const res = document.querySelectorAll(data.selectors.productClass);

        res.forEach((item) => {
          if (item) {
            const itemLink = item
              .querySelector(data.selectors.productLinkClass)
              ?.getAttribute("href");

            if (itemLink) {
              products.push(itemLink);
            }
          }
        });

        return products;
      },
      {
        selectors: {
          productClass: MaxConfig.productContainerClass,
          productLinkClass: MaxConfig.productContainerLinkClass,
        },
      }
    );
  }

  private async extractProductData(page: Page, productUrls: string[]) {
    for (const productLink of productUrls) {
      await page.goto(productLink, { waitUntil: "networkidle" });

      const productData = await page.evaluate(
        (data) => {
          const productName = document.querySelector(
            data.selectors.brandNameClass
          )?.textContent;
          const match = productName?.match(/^([^,]+(?: [^,]+)*)/);
          const productModel = match ? match[0].trim() : "";
          const detailsBtn = <HTMLButtonElement>(
            document.getElementById(data.selectors.detailsBtnClass)
          );
          if (detailsBtn) {
            detailsBtn.click();
          }
          const brandName = document
            .querySelector("tbody .col.data")
            ?.textContent?.trim();

          const salePrice = document
            .querySelector(data.selectors.salePriceClass)
            ?.getAttribute(data.selectors.priceAttributeName);
          const oldPrice = document
            .querySelector(data.selectors.currentPriceClass)
            ?.getAttribute(data.selectors.priceAttributeName);
          const finalPrice = document
            .querySelector(data.selectors.finalPriceClass)
            ?.getAttribute(data.selectors.priceAttributeName);

          const currentPrice = oldPrice ?? finalPrice;

          const sku = document
            .querySelector(data.selectors.skuClass)
            ?.textContent?.trim();
          const productImageUrl = document
            .querySelector(data.selectors.productImageUrlClass)
            ?.getAttribute("src");

          const product: ProductModel = {
            name: productName ?? "",
            brandName: brandName ?? "",
            productDetailUrl: data.productData.detailUrl,
            productImageUrl: productImageUrl ?? "",
            productModel: productModel ?? "",
            storeSku: sku ?? "",
            currentPrice: currentPrice ? Number(currentPrice) : null,
            salePrice: salePrice ? Number(salePrice) : null,
          };

          return product;
        },
        {
          selectors: {
            brandNameClass: MaxConfig.brandNameClass,
            salePriceClass: MaxConfig.salePriceClass,
            priceAttributeName: MaxConfig.priceAttributeName,
            currentPriceClass: MaxConfig.currentPriceClass,
            finalPriceClass: MaxConfig.finalPriceClass,
            skuClass: MaxConfig.skuClass,
            productImageUrlClass: MaxConfig.productImageUrlClass,
            detailsBtnClass: MaxConfig.detailsBtnClass,
          },
          productData: {
            detailUrl: productLink,
          },
        }
      );

      printProduct(productData);
    }
  }
}
