
/**
 * Css classes for extracting data.
 */

export interface SimanConfig {
    parentUrl: string;
    productContainerClass: string;
    productCategories: Array<string>;
    brandNameClass: string;
    productLinkSelector: string;
    noMoreItemsClass: string;
    noMoreItemsText: string;
    itemsAproxPerPage: number;
    addToCartButtonText: string;
}

export const config: SimanConfig = {
    parentUrl: "https://gt.siman.com",
    brandNameClass: ".vtex-store-components-3-x-productBrandName",
    addToCartButtonText: ".vtex-add-to-cart-button-0-x-buttonText",
    productCategories: ["/celulares"],
    productContainerClass: ".vtex-product-summary-2-x-container",
    productLinkSelector: "a",
    noMoreItemsClass: ".lh-copy",
    noMoreItemsText: "No pudimos encontrar lo que estabas buscando",
    itemsAproxPerPage: 20
};