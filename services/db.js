const { Pool } = require('pg');

// Настройка подключения к базе данных
const pool = new Pool({
  user: 'car_user',       // Имя пользователя
  host: 'localhost',      // Хост (обычно localhost)
  database: 'postgres',  // Имя базы данных
  password: 'yourpassword',  // Пароль
  port: 5432,             // Порт PostgreSQL
});

// Функция для выполнения запросов
const query = (text, params) => pool.query(text, params);

module.exports = { query };
