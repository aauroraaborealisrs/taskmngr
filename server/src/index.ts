import express from 'express';
import pool, { testConnection } from './db.js';
import authRoutes from './auth.js';
import cors from 'cors';

const app = express();

app.get('/healthcheck', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'success', timestamp: result.rows[0].now });
  } catch (err) {
    // Add type assertion or type guard
    if (err instanceof Error) {
      res.status(500).json({ status: 'error', message: err.message });
    } else {
      res.status(500).json({ status: 'error', message: 'An unknown error occurred' });
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json()); // Для обработки JSON в теле запроса

// Роуты
app.use('/auth', authRoutes);

const startServer = async () => {
  await testConnection(); // Проверить подключение при запуске сервера
  app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
  });
};

startServer();
