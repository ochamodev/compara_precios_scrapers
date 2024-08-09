
import { chromium, firefox } from "playwright-extra";
import { config } from "./siman_config";
import { SimanProductUrlItem } from "./model/siman_product_url_item";
import { Page, selectors } from "playwright";
import { ProductModel } from "../common/core";
import { getProductSku, isProductListEmpty, takeScreenshot } from "./utils/scraping_utils";
import { humanLikeMouseMovement, logExecutionTime, printProduct } from "../common/utils/scraping_utils";
import { ScrapingArguments } from "./model/scraping_arguments";
export class SimanScraper {
    async start() {
        const start = performance.now();
        const browser = await firefox.launch({
            headless: true
        });

        const page = await browser.newPage();
        let screenshotNumberItem = 0;
        for (const category of config.productCategories) {
            for (let pageNum = 1; ; pageNum++) {
                const finalUrl = config.parentUrl.concat(category,`?page=${pageNum}`);
                console.log(`Navigating to ${finalUrl}`);

                await page.goto(finalUrl, {
                    waitUntil: "networkidle"
                });

                await humanLikeMouseMovement(page, 100, 100, 400, 400);

                //await takeScreenshot(page, `PageScreenshot${pageNum}.png`);
                console.log("now in page ", finalUrl);
                
                try {
                    await page.waitForSelector(config.productContainerClass);
                } catch(error) {
                    console.log("List of items is empty");
                }

                const isListEmpty = await isProductListEmpty(page);

                if (isListEmpty) {
                    console.log(`Page ${pageNum} in ${category} is empty`);
                    break;
                } 
                // running on the browser, extracting links and product items:
                const productUrls: SimanProductUrlItem[] = await this.getProductUrls(page);
                
                console.log(productUrls);
                
                for (const productLink of  productUrls) {
                    screenshotNumberItem++;
                    
                    await page.goto(productLink.detailUrl, {waitUntil: "networkidle"});
                    const productSku = getProductSku(productLink.detailUrl);

                    const scrapingArguments: ScrapingArguments = this.getScrapingArguments(productLink, productSku);

                    //await takeScreenshot(page, `testRessultItem${screenshotNumberItem}.png`);

                    try {
                        await page.waitForSelector(config.showMoreBtnClass);
                    } catch(error) {
                        // probably an accesory so skip for now
                        console.log("show more button not found");
                        continue;
                    }
                    
                    const productModel = await page.evaluate((data) => {
                        const brandName = document.querySelector(data.selectors.brandNameClass)?.textContent;
                        const productImgUrl = (<HTMLImageElement>document.querySelector(`${data.selectors.imageClass}`))?.src;
                        const productName = document.querySelector(".nombreProducto")?.textContent;
                        const viewMoreBtn = (<HTMLButtonElement>document.querySelector(data.selectors.showMoreBtnClass));
                        if (viewMoreBtn) {
                            viewMoreBtn.click();
                        }
                        const listPriceValue = (<HTMLElement>document.querySelector(data.selectors.listPriceValueClass))?.textContent;
                        const sellingPriceValue = (<HTMLElement>document.querySelector(data.selectors.sellingPriceValueClass))?.textContent;
                        const listItems = document.querySelector(data.selectors.specificationList);
                        let productModel = "";

                        for (let specification of listItems!.childNodes) {
                            if ((<HTMLElement>specification).innerText.includes('Modelo')) {
                                let model = <HTMLElement>(<HTMLElement>specification).querySelector('.siman-m3-custom-1-x-specificationValue');
                                console.log(model.innerText);
                                productModel = model.innerText;
                            }
                        }
                        
                        const product: ProductModel = {
                            name: productName ?? "",
                            brandName: brandName ?? "",
                            productDetailUrl: data.productData.detailUrl,
                            productImageUrl: productImgUrl ?? "",
                            productModel: productModel,
                            storeSku: data.productData.sku,
                            currentPrice: null,
                            salePrice: null
                        };

                        const priceRegex = /[^\d.-]/g;

                        // Not in sale
                        if (!listPriceValue) {
                            const price = sellingPriceValue?.replace(priceRegex, '');
                            product.currentPrice = price ? parseFloat(price) : 0;
                        } else {
                            const salePrice = sellingPriceValue?.replace(priceRegex, '');
                            const normalPrice = listPriceValue?.replace(priceRegex, '');
                            product.salePrice = salePrice ? parseFloat(salePrice) : 0;
                            product.currentPrice = normalPrice ? parseFloat(normalPrice) : 0;
                        }

                        return product;
                    }, scrapingArguments);
                    //printProduct(productModel);
                }
            }
        }
        page.close();
        browser.close();
        const end = performance.now()
        console.log("Finished execution");
        console.log(`Execution time: ${logExecutionTime(end - start)}`);
    }

    private async getProductUrls(page: Page): Promise<SimanProductUrlItem[]> {
        return await page.$$eval(config.productContainerClass, elements => {
            const urls = elements.map(it => {
                const url = it.querySelector("a");
                const simanProductUrlItem: SimanProductUrlItem = {
                    detailUrl: url ? url.href : ""
                };
                return simanProductUrlItem;
            });
            return urls;
        });
    }

    private getScrapingArguments(productLink: SimanProductUrlItem, productSku: string): ScrapingArguments {
        return {
            selectors: {
                brandNameClass: config.brandNameClass,
                showMoreBtnClass: config.showMoreBtnClass,
                imageClass: config.productImgUrl,
                sellingPriceValueClass: config.sellingPriceValueClass,
                listPriceValueClass: config.listPriceValueClass,
                specificationList: config.specificationListClass
            },
            productData: {
                detailUrl: productLink.detailUrl,
                sku: productSku
            }
        };
    }

}