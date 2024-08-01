import { KemikScraper } from "./scraper";

(async () => {
  const scraper = new KemikScraper();
  await scraper.scrape();
})();
