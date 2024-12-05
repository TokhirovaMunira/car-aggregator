const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./db');

// Функция для парсинга сайта Olx.uz
async function scrapeOlx() {
  console.log("starting scraping");
  try {
    const { data } = await axios.get("https://www.olx.uz/transport/legkovye-avtomobili/?page=2");
    const $ = cheerio.load(data);
    //console.log(data);

    $(`[data-cy="l-card"]`).each(async (_, element) => {
      let title = $(element).find(`[data-cy="ad-card-title"]`).text().trim();
      let price = $(element).find(`[data-testid="ad-price"]`).text().trim();
      let location = $(element).find(`[data-testid="location-date"]`).text().trim();
      let url = $(element).find(".lheight22 .title-cell a").attr("href");
      title = title.length < 255 ? title : "no title";
      price = price.length < 255 ? price : "no price";
      location = location.length < 255 ? location : "no location";
      console.log("title:", title, "price:", price, "location:", location);

      //   $(".offer-wrapper").each(async (_, element) => {
      //     const title = $(element).find(".lheight22 .title-cell strong").text().trim();
      //     const price = $(element).find(".price strong").text().trim();
      //     const location = $(element).find(".bottom-cell small").text().trim();
      //     const url = $(element).find(".lheight22 .title-cell a").attr("href");
      //     console.log("title:",title);

      // Проверяем, есть ли уже такая машина в базе
      const result = await db.query("SELECT * FROM cars WHERE url = $1", [url]);
      if (result.rows.length === 0) {
        // Если нет, добавляем в базу
        await db.query(
          "INSERT INTO cars (title, price, location, url, source) VALUES ($1, $2, $3, $4, $5)",
          [title, price, location, url, "Olx.uz"]
        );
      }
    });
  } catch (err) {
    console.error("Error scraping Olx:", err.message);
  }
}

module.exports = { scrapeOlx };
