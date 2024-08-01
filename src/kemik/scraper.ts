import { chromium, firefox } from "playwright";
import { ProductModel } from "../common/core";
import { printProduct } from "../common/utils/scraping_utils";
import { config } from "./config";

export class KemikScraper {
  constructor() {
    console.log("KemikScraper constructor");
  }

  public async scrape() {
    console.log("KemikScraper scrape");
  }
}
