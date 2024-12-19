const express = require('express');
const cors = require('cors');
//const { scrapeOlx, scrapeUzumAvto } = require('./services/scraper');
const { scrapeOlx, scrapeAvtoelon, scrapeTelegram } = require('./services/scraper');
const app = express();
const pool = require('./services/db');
const path = require('path');
const cheerio = require('cheerio');



// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут для страницы "О компании"
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});



// Разрешаем запросы с фронтенда
app.use(cors());


// Маршрут для получения данных о машинах
// app.get('/cars', (req, res) => {
//   // Предположим, что у тебя есть массив данных машин или база данных
//   const cars = [
//     { id: 1, title: 'Car 1', price: '10000', location: 'Tashkent', url: 'https://olx.uz' },
//     { id: 2, title: 'Car 2', price: '20000', location: 'Samarkand', url: 'https://avtoelon.uz' },
//   ];

//   res.json(cars); // Отправляем данные в формате JSON
// });

app.get('/api/cars', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Получаем номер текущей страницы, если он не передан, по умолчанию 1
    const limit = 42; // Количество элементов на странице
    const offset = (page - 1) * limit; // Рассчитываем смещение для базы данных

    // Запрашиваем данные с ограничением по количеству и смещению
    const result = await pool.query('SELECT * FROM public.cars LIMIT $1 OFFSET $2', [limit, offset]);

    // Получаем общее количество записей в таблице для расчета totalPages
    const totalCarsResult = await pool.query('SELECT COUNT(*) FROM public.cars');
    const totalCars = parseInt(totalCarsResult.rows[0].count);

    // Рассчитываем общее количество страниц
    const totalPages = Math.ceil(totalCars / limit);

    // Возвращаем данные вместе с информацией о пагинации
    res.json({
      results: result.rows,
      count: totalCars,
      page: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Запуск сервера
const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await scrapeTelegram();
  await scrapeOlx();
  //await scrapeUzumAvto();
  await scrapeAvtoelon();
  
});

