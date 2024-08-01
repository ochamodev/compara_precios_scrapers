export interface KemikConfig {
  base_url: string;
  category_sub_path: string;
  category_paths: string[];
  product_item_selector: string;
}

export const config: KemikConfig = {
  base_url: "https://www.kemik.gt",
  category_sub_path: "/tienda-en-linea",
  category_paths: ["/celulares"],
  product_item_selector: ".product-summary_product-summary__dYYlE",
};
