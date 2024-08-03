import { KemikScraper } from "./scraper";
import { config } from "./config";

(async () => {
  config.category_paths.forEach(async (category) => {
    const scraper = new KemikScraper(category);
    await scraper.scrape();
  });
})();
