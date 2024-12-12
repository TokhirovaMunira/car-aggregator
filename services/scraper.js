const axios = require('axios');
const pool = require('./db'); // Подключаем базу данных
const https = require('https');
const agent = new https.Agent({ keepAlive: true });


async function scrapeOlx() {
  const limit = 10; // Количество объявлений за запрос
  let offset = 0;
  let hasMore = true;
  let finish = 0;

  try {
    while (hasMore) {
      const url = `https://www.olx.uz/api/v1/offers/?offset=${offset}&limit=${limit}&category_id=108`;
      const response = await axios.get(url);

      if (response.data && response.data.data.length > 0 && finish < 3) {
        const cars = response.data.data;

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

          const priceParam = params.find(p => p.key === 'price');
          const price = priceParam ? priceParam.value.converted_value || null : null;

          const city = location?.city?.name || null;
          const region = location?.region?.name || null;
          const mainPhoto = photos?.[0]?.link.replace('{width}', '800').replace('{height}', '600') || null;

          // Вставка в базу данных
          await pool.query(
            'INSERT INTO public.cars (source, external_id, title, description, price, location_city, location_region, url, photo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (external_id) DO NOTHING',
            ['olx', id, title, description, price, city, region, url, mainPhoto]
          );
        }

        console.log(`Processed ${cars.length} cars (offset: ${offset})`);
        offset += limit; // Увеличиваем смещение для следующего запроса
        finish = finish + 1;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        hasMore = false; // Заканчиваем цикл, если новых данных нет
      }
    }
  } catch (error) {
    console.error('Error scraping OLX:', error.message);
  }
}

async function scrapeUzumAvto() {
  const url = 'https://uzumavto.uz/api/v1/user/graphql';
  let cursor = null; // Для постраничной загрузки
  const limit = 10; // Количество объявлений на одну страницу
  let finish = 0;

  try {
    do {
      // Тело запроса
      const requestBody = {
        query: `query getFeedList($input: GetFeedListInput!) {
          getFeedList(input: $input) {
            items {
              id
              title
              price {
                strValue
                value
              }
              additionalInfo
              carousel {
                items {
                  origUrl
                }
              }
              publishInfo
            }            
          }
        }`,
        variables: {
          input: {
            limit,
            sortKey: 'Default',
            showCase: 'Default',
          },
        },
      };

      // Отправка POST-запроса
      const response = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '1500',
          'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
          'Accept': 'application/json',
          // 'Accept-Language': 'uz',
          // 'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Referer': 'https://webview.uzumavto.uz/',
          'Origin': 'https://webview.uzumavto.uz',
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache',
        },
        httpsAgent: agent,
      });

      const data = response.data?.data?.getFeedList;
      console.error('Response data:', error.response?.data);


      if (data && data.items) {
        for (const item of data.items) {
          const {
            id,
            title,
            price,
            additionalInfo,
            carousel,
            publishInfo,
          } = item;

          const mainPhoto = carousel?.items?.[0]?.origUrl || null;
          const formattedPrice = price?.strValue || null;
          const rawPrice = price?.value || null;

          // Сохранение данных в базу данных
          await pool.query(
            `INSERT INTO public.cars (
              source, external_id, title, description, price, raw_price, location_city, photo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (external_id) DO NOTHING`,
            [
              'uzumavto',
              id,
              title,
              additionalInfo,
              formattedPrice,
              rawPrice,
              publishInfo,
              mainPhoto,
            ]
          );

          console.log(`Added car: ${title}`);
        }

        // Обновление курсора для загрузки следующей страницы
        // cursor = data.cursor;
        finish = finish + 1;
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log('No items found on this page.');
        break;
      }
    } while (cursor && finish<3); // Продолжаем, пока есть курсор
  } catch (error) {
    console.error('Error scraping UzumAvto:', error.message);
  }
}

scrapeUzumAvto();

module.exports = { scrapeOlx, scrapeUzumAvto };
