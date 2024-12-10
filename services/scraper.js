const axios = require('axios');
const pool = require('./db'); // Подключаем базу данных

async function scrapeOlx() {
  try {
    // URL API OLX
    const url = 'https://www.olx.uz/api/v1/offers/?offset=0&limit=10&category_id=108';

    // Отправляем GET-запрос к API OLX
    const response = await axios.get(url);

    // Проверяем наличие данных
    if (response.data && response.data.data) {
      const cars = response.data.data;

      // Проходим по каждому объявлению
      for (const car of cars) {
        const {
          id,
          url,
          title,
          description,
          params,
          location,
          photos,
        } = car;

        // Ищем параметры (цена, год выпуска, пробег и т. д.)
        const priceParam = params.find(p => p.key === 'price');
        const price = priceParam ? priceParam.value.converted_value || null : null;

        const yearParam = params.find(p => p.key === 'motor_year');
        const year = yearParam ? yearParam.value.key || null : null;

        const mileageParam = params.find(p => p.key === 'motor_mileage');
        const mileage = mileageParam ? mileageParam.value.key || null : null;

        // Город и регион
        const city = location?.city?.name || null;
        const region = location?.region?.name || null;

        // Основное фото
        const mainPhoto = photos?.[0]?.link.replace('{width}', '800').replace('{height}', '600') || null;

        // Вставляем данные в базу данных
        await pool.query(
          'INSERT INTO public.cars (source, external_id, title, description, price, year, mileage, location_city, location_region, url, photo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (external_id) DO NOTHING',
          ['olx', id, title, description, price, year, mileage, city, region, url, mainPhoto]
        );

        console.log(`Added car: ${title}`);
      }
    } else {
      console.log('No cars found in API response.');
    }
  } catch (error) {
    console.error('Error scraping OLX:', error.message);
  }
  return null;
}

module.exports = { scrapeOlx };
