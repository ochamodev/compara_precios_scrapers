
import { chromium, firefox } from "playwright-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { config } from "./siman_config";
import { SimanProductUrlItem } from "./model/siman_product_url_item";
import { Page, selectors } from "playwright";
import { ProductModel } from "../common/core";
import { getProductSku } from "./utils/scraping_utils";
import { printProduct } from "../common/utils/scraping_utils";
export class SimanScraper {
    async start() {

        firefox.use(StealthPlugin());

        const browser = await firefox.launch({
            headless: true
        });

        const page = await browser.newPage();
        let j = 1;
        for (const category of config.productCategories) {
            let pageNum = 1;
            while (true) {
                const finalUrl = config.parentUrl.concat(category,`?page=${pageNum}`);
                console.log("navigating to ", finalUrl);
                await page.goto(finalUrl, {
                    waitUntil: "networkidle"
                });
                const humanLikeMouseMovement = async (page: any, startX : any, startY : any, endX : any, endY : any) => {
                    await page.mouse.move(startX, startY);
                    await page.waitForTimeout(100 + Math.random() * 100); // Add some randomness in the movement
                    await page.mouse.move(endX, endY, { steps: 5 + Math.random() * 5 });
                };
                
                await humanLikeMouseMovement(page, 100, 100, 400, 400);
                //await page.screenshot({path: `PageScreenshot${pageNum}.png`, fullPage: true})
                console.log("now in page ", finalUrl);

                const isListEmpty = await this.isProductListEmpty(page);

                if (isListEmpty) {
                    break;
                }

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
                
                for (const productLink of  productUrls) {
                    j++;
                    //await page.screenshot({path: `testResultItem${j}.png`, fullPage: true})
                    await page.goto(productLink.detailUrl, {waitUntil: "networkidle"});
                    const productSku = getProductSku(productLink.detailUrl);
                    const productModel = await page.evaluate((data) => {
                        setTimeout(() => {
                            // waiting to load description
                        }, 1000);
                        const brandName = document.querySelector(data.selectors.brandNameClass)?.textContent;
                        const productImgUrl = (<HTMLImageElement>document.querySelector(`${data.selectors.imageClass}`))?.src;
                        const productName = document.querySelector('.nombreProducto')?.textContent;
                        const viewMoreBtn = (<HTMLButtonElement>document.querySelector(data.selectors.showMoreBtnClass));
                        if (viewMoreBtn != null) {
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
                            name: productName ? productName : "",
                            brandName: brandName ? brandName : "",
                            productDetailUrl: data.productData.detailUrl,
                            productImageUrl: productImgUrl ? productImgUrl : "",
                            productModel: productModel,
                            storeSku: data.productData.sku,
                            currentPrice: null,
                            salePrice: null
                        };

                        const priceRegex = /[^\d.-]/g;

                        // Not in sale
                        if (listPriceValue == null) {
                            const price = sellingPriceValue?.replace(priceRegex, '');
                            product.currentPrice = price ? parseFloat(price) : 0;
                        } else {
                            const salePrice = sellingPriceValue?.replace(priceRegex, '');
                            const normalPrice = listPriceValue?.replace(priceRegex, '');
                            product.salePrice = salePrice ? parseFloat(salePrice) : 0;
                            product.currentPrice = normalPrice ? parseFloat(normalPrice) : 0;
                        }

                        return product;
                    }, {
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
                    });
                    //const productName = await page.evaluate((brandNameClass) => document.querySelector('.nombreProducto')?.textContent, config.brandNameClass);
                    printProduct(productModel);
                    //console.log(productName);
                }
                
                pageNum++;
            }
        }
        
    }

    async isProductListEmpty(page: Page): Promise<boolean>{
        const thereAreNoItems = await page.$$eval(config.noMoreItemsClass, elements => {
            const content = elements[0].textContent
            return content;
        });

        if (thereAreNoItems?.includes("No pudimos encontrar lo que estabas buscando")) {
            return true;
        }

        return false;
    }

}