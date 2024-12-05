const express = require('express');
const cors = require('cors');
const { scrapeOlx } = require('./services/scraper');
const app = express();
const pool = require('./services/db');


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

app.get('/cars', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars');
    res.json(result.rows); // Возвращаем содержимое таблицы cars
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Запуск сервера
const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await scrapeOlx();
});
