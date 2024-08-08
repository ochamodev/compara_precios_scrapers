import { PacifikoScraper } from "./scraper";

(async () => {
  const scraper = new PacifikoScraper([
    "/index.php?route=product/category&path=507876&path=507876", // Celulares y Smartphones Desbloqueados
    "/index.php?route=product/category&path=507873&path=507873", // Celulares y Smartphones de Prepago
  ]);
  await scraper.scrape();
})();
