export interface PacifikoConfigType {
  parentUrl: string;
  productContainerClass: string;
  nameSelectorClass: string;
  brandSelectorClass: string;
  imageSelectorClass: string;
  priceSelectorClass: string;
  priceOldSelectorClass: string;
  saleSelectorClass: string;
  productModelSelectorClass: string;
  productModelText: string;
  productModelCellSelectorClass: string;
  productModelCellValueSelectorClass: string;
}

export const PacifikoConfig: PacifikoConfigType = {
  parentUrl: "https://www.pacifiko.com",
  productContainerClass: ".product-item-container",
  nameSelectorClass: ".title-product h1",
  brandSelectorClass: ".brand a",
  imageSelectorClass: ".product-image-zoom.lazyautosizes.lazyloaded",
  priceSelectorClass: ".form-group.box-info-product .price",
  priceOldSelectorClass: ".price-old",
  saleSelectorClass: ".label-product.label-sale",
  productModelSelectorClass: ".left-div-attributes table tbody tr",
  productModelText: "número de modelo",
  productModelCellSelectorClass: "td.propery-title-t",
  productModelCellValueSelectorClass: "td.propery-des-t",
};
