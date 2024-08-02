import { KemikScraper } from "./scraper";
import { config } from "./config";

(async () => {
  const scraper = new KemikScraper(config.category_paths[0]);
  await scraper.scrape();
})();
