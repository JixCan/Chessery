const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Настройка подключения к PostgreSQL
const pool = new Pool({
  user: 'postgres',       // Ваш пользователь
  host: 'localhost',      // Хост базы данных
  database: 'chess_puzzles', // Имя базы данных
  password: 'sigma',  // Ваш пароль
  port: 5432,             // Порт по умолчанию для PostgreSQL
});

// Функция для выбора случайной задачи
app.get('/api/random-puzzle', async (req, res) => {
    try {
      // Получаем общее количество записей
      const countResult = await pool.query('SELECT COUNT(*) FROM puzzle_ids');
      const totalCount = parseInt(countResult.rows[0].count, 10);
  
      // Генерируем случайный индекс
      const randomIndex = Math.floor(Math.random() * totalCount);
  
      // Получаем случайный ID
      const idResult = await pool.query('SELECT id FROM puzzle_ids OFFSET $1 LIMIT 1', [randomIndex]);
      const puzzleId = idResult.rows[0].id;
  
      // Получаем данные пазла по ID
      const puzzleResult = await pool.query('SELECT * FROM puzzles WHERE id = $1', [puzzleId]);
      const randomPuzzle = puzzleResult.rows[0];
  
      res.json(randomPuzzle);
    } catch (error) {
      console.error('Ошибка при получении задачи:', error);
      res.status(500).json({ error: 'Ошибка при получении задачи' });
    }
  });
  

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
