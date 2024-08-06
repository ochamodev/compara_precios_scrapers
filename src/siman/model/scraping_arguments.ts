
/**
 * selectors: {
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
 * 
 */

export interface ScrapingArguments {
    selectors: ScrapingSelectors;
    productData: ProductData
}

interface ScrapingSelectors {
    brandNameClass: string;
    showMoreBtnClass: string;
    imageClass: string;
    sellingPriceValueClass: string;
    listPriceValueClass: string;
    specificationList: string;
}

interface ProductData {
    detailUrl: string;
    sku: string
}