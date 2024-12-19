const axios = require('axios');
const pool = require('./db'); // Подключаем базу данных
const https = require('https');
const cheerio = require('cheerio');
const agent = new https.Agent({ keepAlive: true });
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input'); // Для чтения ввода пользователя (если потребуется)

const apiId = 21634824; // Замените на ваш api_id
const apiHash = '7a0cd899cc30ff4274cd91dff3f778ec'; // Замените на ваш api_hash
const channelUsername = 'AvtoUz_bozor01'; // Ссылка на канал

const session = new StringSession(''); // Оставьте строку пустой для новой сессии
const client = new TelegramClient(session, apiId, apiHash, {
  connectionRetries: 5,
});

async function scrapeOlx() {
  const limit = 10; // Количество объявлений за запрос
  let offset = 0;
  let hasMore = true;
  let finish = 0;
  const maxIterations = 2; // Максимальное количество итераций для защиты от зацикливания
  let iterationCount = 0;

  try {
    while (hasMore) {
      iterationCount += 1;

      if (iterationCount > maxIterations) {
        console.error('Превышен лимит итераций. Цикл завершен.');
        break;
      }

      const url = `https://www.olx.uz/api/v1/offers/?offset=${offset}&limit=${limit}&category_id=108`;
      const response = await axios.get(url, { httpsAgent: agent });

      if (response.data && response.data.data && response.data.data.length > 0) {
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
          const priceUsd = priceParam ? priceParam.value.value || null : null;

          const city = location?.city?.name || null;
          const region = location?.region?.name || null;
          const mainPhoto = photos?.[0]?.link.replace('{width}', '800').replace('{height}', '600') || null;

          // Вставка в базу данных
          await pool.query(
            'INSERT INTO public.cars (source, external_id, title, description, price, price_usd, location_city, location_region, url, photo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (external_id) DO NOTHING',
            ['olx', id, title, description, price, priceUsd, city, region, url, mainPhoto]
          );
        }

        console.log(`Processed ${cars.length} cars (offset: ${offset})`);
        offset += limit; // Увеличиваем смещение для следующего запроса
        finish += 1; // Увеличиваем счетчик успешных обработок
        await new Promise(resolve => setTimeout(resolve, 2000)); // Задержка перед следующим запросом
      } else {
        console.log('Нет новых данных, завершение цикла.');
        hasMore = false;
      }
    }
  } catch (error) {
    console.error('Error scraping OLX:', error.message);
  }
}

//avtoelon

async function scrapeAvtoelon() {
  const url = 'https://avtoelon.uz/avto/';

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(html);
    const source = 'avtoelon';

    $('.a-elem').each(async (index, element) => {
      const title = $(element).find('.a-el-info-title').text().trim();
      const priceText = $(element).find('.price').text().trim();
      const locationText = $(element).find('.a-info-text__region').text().trim();
      const url = 'https://avtoelon.uz' + $(element).find('a').attr('href');
      const photo = $(element).find('img.a-elem__image').attr('src');

      // Парсим цену (например, удаляем символы валюты)
      const priceUsd = parseInt(priceText.replace(/\D/g, ''), 10) || null;
      const price = null;

      // Конвертация валюты (условно, курс 1 USD = 12,000 UZS)
      //const priceUsd = price ? Math.round(price / 12000) : null;

      const location_city = locationText;
      const location_region = null;

      // Уникальный идентификатор: генерируем из URL
      const external_id = url.split('/').pop();

      try {
        // Сохраняем в базу данных
        await pool.query(
          `INSERT INTO public.cars (
            source, external_id, title, description, price, price_usd, location_city, location_region, url, photo
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (external_id) DO NOTHING`,
          [source, external_id, title, null, price, priceUsd, location_city?.trim() || null, location_region?.trim() || null, url, photo]
        );

        //console.log(`Inserted: ${title}`);
      } catch (dbError) {
        console.error('DB Error:', dbError.message);
      }
    });
  } catch (error) {
    console.error('Error scraping Avtoelon:', error.message);
  }
}

//telegram

async function scrapeTelegram() {
  try {
    console.log('Connecting to Telegram...');
    await client.start({
      phoneNumber: async () => await input.text('Введите ваш номер телефона:'),
      password: async () => await input.text('Введите пароль (если требуется):'),
      phoneCode: async () => await input.text('Введите код из Telegram:'),
      onError: (err) => console.error(err),
    });
    console.log('Connected!');

    let hasMore = true;
    let offsetId = 0; // Используется для пагинации сообщений
    const limit = 10; // Количество сообщений за запрос
    const maxIterations = 2; // Максимальное количество итераций для защиты от зацикливания
    let iterationCount = 0;

    while (hasMore) {
      iterationCount += 1;

      if (iterationCount > maxIterations) {
        console.error('Превышен лимит итераций. Цикл завершен.');
        break;
      }

      // Получаем сообщения из канала
      const messages = await client.getMessages(channelUsername, {
        limit,
        offsetId,
      });

      if (messages.length > 0) {
        for (const message of messages) {
          const { id, message: text, date, media } = message;
          try {
            const utf8Message = Buffer.from(text, "utf8").toString();
            var title = utf8Message.split('\n')[0];
            // Генерация URL фотографии, если есть медиа
            const photoUrl = media
              ? await client.downloadMedia(media, { type: 'document', workers: 1 })
              : null;
            // const priceMatch = text.match(/💸: ([0-9.,]+)\$/); // Ищем цену
            // const priceUsd = priceMatch ? parseFloat(priceMatch[1].replace(",", "")) : null;

            // const cityMatch = text.match(/▶️: ([\w\s]+)/); // Ищем город
            // const city = cityMatch ? cityMatch[1].trim() : null;

            const external_id = `telegram_${message.id}`; // Уникальный ID из Telegram ID
            // Запись в базу данных
            await pool.query(
              `INSERT INTO public.cars (
    source, external_id, title, description, price, price_usd, location_city, location_region, url, photo
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  ON CONFLICT (external_id) DO NOTHING`,
              [
                'telegram',
                id,
                title,
                utf8Message,
                null,
                null,
                null,
                null, // Регион отсутствует в сообщениях
                null, // URL отсутствует в Telegram
                null,
              ]
            );

          } catch (hello) {
            console.error("Ошибка: ", hello.message);
          }

          // Разбиваем текст сообщения на части для получения данных
          // const match = text.match(/(.+)\nЦена: (\d+[.,]?\d*)\s*([A-Za-zА-Яа-я]+)?\nГород: (.+)/);
          // if (match) {
          //   const [, title, priceText, currency, city] = match;
          //   const priceUsd = currency && currency.toLowerCase() === 'usd'
          //     ? parseFloat(priceText.replace(',', '.'))
          //     : null;
          //   const price = priceUsd ? Math.round(priceUsd * 13000) : null; // Условно конвертируем в UZS

          //   // Запись в базу данных
          //   await pool.query(
          //     `INSERT INTO public.cars (
          //       source, external_id, title, description, price, price_usd, location_city, location_region, url, photo
          //     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          //     ON CONFLICT (external_id) DO NOTHING`,
          //     [
          //       'telegram',
          //       id,
          //       title.trim(),
          //       text.trim(),
          //       price,
          //       priceUsd,
          //       city.trim(),
          //       null, // Регион отсутствует в сообщениях
          //       null, // URL отсутствует в Telegram
          //       photoUrl || null,
          //     ]
          //   );
          // } else {
          //   console.warn(`Не удалось распознать формат сообщения: ${text}`);
          // }
        }

        console.log(`Processed ${messages.length} messages (offsetId: ${offsetId})`);
        offsetId = messages[messages.length - 1].id; // Обновляем offsetId для следующей итерации
      } else {
        console.log('Нет новых сообщений, завершение цикла.');
        hasMore = false;
      }

      await new Promise(resolve => setTimeout(resolve, 2000)); // Задержка перед следующим запросом
    }
  } catch (error) {
    console.error('Error scraping Telegram:', error.message);
  } finally {
    await client.disconnect();
  }
}

module.exports = { scrapeOlx, scrapeAvtoelon, scrapeTelegram };

//UzumAvto
//scrapeUzumAvto();

// async function scrapeUzumAvto() {
//   const url = 'https://uzumavto.uz/api/v1/user/graphql';
//   let cursor = null; // Для постраничной загрузки
//   const limit = 10; // Количество объявлений на одну страницу
//   let finish = 0;

//   try {
//     do {
//       // Тело запроса
//       const requestBody = {
//         query: `query getFeedList($input: GetFeedListInput!) {
//           getFeedList(input: $input) {
//             items {
//               id
//               title
//               price {
//                 strValue
//                 value
//               }
//               additionalInfo
//               carousel {
//                 items {
//                   origUrl
//                 }
//               }
//               publishInfo
//             }            
//           }
//         }`,
//         variables: {
//           input: {
//             limit,
//             sortKey: 'Default',
//             showCase: 'Default',
//           },
//         },
//       };

//       // Отправка POST-запроса
//       const response = await axios.post(url, requestBody, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Content-Length': '1500',
//           'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
//           'Accept': 'application/json',
//           // 'Accept-Language': 'uz',
//           // 'Accept-Encoding': 'gzip, deflate, br, zstd',
//           'Referer': 'https://webview.uzumavto.uz/',
//           'Origin': 'https://webview.uzumavto.uz',
//           'Pragma': 'no-cache',
//           'Cache-Control': 'no-cache',
//         },
//         httpsAgent: agent,
//       });

//       const data = response.data?.data?.getFeedList;
//       console.error('Response data:', error.response?.data);


//       if (data && data.items) {
//         for (const item of data.items) {
//           const {
//             id,
//             title,
//             price,
//             additionalInfo,
//             carousel,
//             publishInfo,
//           } = item;

//           const mainPhoto = carousel?.items?.[0]?.origUrl || null;
//           const formattedPrice = price?.strValue || null;
//           const rawPrice = price?.value || null;

//           // Сохранение данных в базу данных
//           await pool.query(
//             `INSERT INTO public.cars (
//               source, external_id, title, description, price, raw_price, location_city, photo
//             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (external_id) DO NOTHING`,
//             [
//               'uzumavto',
//               id,
//               title,
//               additionalInfo,
//               formattedPrice,
//               rawPrice,
//               publishInfo,
//               mainPhoto,
//             ]
//           );

//           console.log(`Added car: ${title}`);
//         }

//         // Обновление курсора для загрузки следующей страницы
//         // cursor = data.cursor;
//         finish = finish + 1;
//         await new Promise(resolve => setTimeout(resolve, 2000));
//       } else {
//         console.log('No items found on this page.');
//         break;
//       }
//     } while (cursor && finish<3); // Продолжаем, пока есть курсор
//   } catch (error) {
//     console.error('Error scraping UzumAvto:', error.message);
//   }
// }

// scrapeUzumAvto();