const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'sigma'; // Храните в среде окружения

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

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/api/update-rating', authenticateToken, async (req, res) => {
  const { newRating } = req.body;
  const userId = req.user.id;

  try {

    // Обновляем рейтинг в базе данных
    await pool.query('UPDATE users SET rating = $1 WHERE id = $2', [newRating, userId]);

    res.json({ newRating });
  } catch (error) {
    console.error('Ошибка при обновлении рейтинга:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});


// Регистрация
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
      // Проверка на существующего пользователя
      const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (userCheck.rows.length > 0) {
          return res.status(400).json({ message: 'Пользователь уже существует' });
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      // Сохранение пользователя
      const newUser = await pool.query(
          'INSERT INTO users (username, password, rating, pgn, email) VALUES ($1, $2, 1000, $3, $4) RETURNING *',
          [username, hashedPassword, '', email]
      );

      const token = jwt.sign({ id: newUser.rows[0].id, username }, SECRET_KEY);
      res.status(201).json({ token, username: newUser.rows[0].username, rating: newUser.rows[0].rating, pgn: newUser.rows[0].pgn, email: newUser.rows[0].email});
  } catch (error) {
      console.error('Ошибка при регистрации:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Вход
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

      if (user.rows.length === 0) {
          return res.status(400).json({ message: 'Неверные учетные данные' });
      }

      // Проверка пароля
      const validPassword = await bcrypt.compare(password, user.rows[0].password);
      if (!validPassword) {
          return res.status(400).json({ message: 'Неверные учетные данные' });
      }

      // Генерация токена с использованием данных пользователя
      const token = jwt.sign({ id: user.rows[0].id, username }, SECRET_KEY);
      
      // Возвращаем данные авторизованного пользователя
      res.json({ token, username: user.rows[0].username, rating: user.rows[0].rating, pgn: user.rows[0].pgn, email: user.rows[0].email });
  } catch (error) {
      console.error('Ошибка при входе:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
  }
});


// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
