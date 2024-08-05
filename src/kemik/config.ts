export interface KemikConfig {
  base_url: string;
  category_sub_path: string;
  category_paths: string[];
  grid_product_item_selector_class: string;
  product_detail_image_selector_class: string;
  product_detail_name_selector_class: string;
  product_detail_brand_selector_class: string;
  product_detail_price_selector_class: string;
  product_detail_sale_price_selector_class: string;
  product_detail_sale_price_cents_selector_class: string;
  product_detail_sku_selector_class: string;
}

export const config: KemikConfig = {
  base_url: "https://www.kemik.gt",
  category_sub_path: "/tienda-en-linea",
  category_paths: ["/celulares"],
  grid_product_item_selector_class: ".product-summary_product-summary__dYYlE",
  product_detail_image_selector_class: ".product-images-slider_cdn-image__1WUxw",
  product_detail_name_selector_class: ".page-body-title_heading__qL5u6",
  product_detail_brand_selector_class: ".product-page_link__egrqB",
  product_detail_price_selector_class: ".product-price-before_price__d6FRc",
  product_detail_sale_price_selector_class: ".price_price__a8YAx > .price_price__xQt90",
  product_detail_sale_price_cents_selector_class: ".price_price__xQt90 > .price_cents__QWFgU",
  product_detail_sku_selector_class: ".product-page_public-sku__sbQqe",
};