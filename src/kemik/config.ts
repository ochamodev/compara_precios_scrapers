export interface KemikConfig {
  base_url: string;
  category_sub_path: string;
  category_paths: string[];
  grid_product_item_selector: string;
  product_detail_image_selector: string;
  product_detail_name_selector: string;
  product_detail_brand_selector: string;
  product_detail_price_selector: string;
  product_detail_sale_price_selector: string;
  product_detail_sale_price_cents_selector: string;
  product_detail_sku_selector: string;
}

export const config: KemikConfig = {
  base_url: "https://www.kemik.gt",
  category_sub_path: "/tienda-en-linea",
  category_paths: ["/celulares"],
  grid_product_item_selector: ".product-summary_product-summary__dYYlE",
  product_detail_image_selector: ".product-images-slider_cdn-image__1WUxw",
  product_detail_name_selector: ".page-body-title_heading__qL5u6",
  product_detail_brand_selector: ".product-page_link__egrqB",
  product_detail_price_selector: ".product-price-before_price__d6FRc",
  product_detail_sale_price_selector: ".price_price__a8YAx > .price_price__xQt90",
  product_detail_sale_price_cents_selector: ".price_price__xQt90 > .price_cents__QWFgU",
  product_detail_sku_selector: ".product-page_public-sku__sbQqe",
};