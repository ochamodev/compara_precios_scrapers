export interface MaxConfigType {
  parentUrl: string;
  productClassContainer: string;
  productCategories: Array<string>;
  noMoreItemsClass: string;
  productContainerClass: string;
  productContainerLinkClass: string;
  brandNameClass: string;
  priceAttributeName: string;
  salePriceClass: string;
  currentPriceClass: string;
  finalPriceClass: string;
  skuClass: string;
  productImageUrlClass: string;
}

export const MaxConfig: MaxConfigType = {
  parentUrl: "https://www.max.com.gt",
  productClassContainer: ".products .wrapper .grid .products-grid",
  productCategories: ["/celulares/liberados"],
  noMoreItemsClass: ".message .info .empty",
  productContainerClass: ".product-item",
  productContainerLinkClass: ".product-item-link",
  brandNameClass: ".base",
  priceAttributeName: "data-price-amount",
  salePriceClass: ".product-info-price .special-price .price-wrapper",
  currentPriceClass: ".product-info-price .old-price .price-wrapper",
  finalPriceClass:
    ".product-info-price .price-box.price-final_price .price-wrapper",
  skuClass: ".product.attribute.sku .value",
  productImageUrlClass: ".fotorama__img",
};
