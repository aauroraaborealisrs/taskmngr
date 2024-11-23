import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

interface RegisterRequestBody {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }
  
  router.post('/register', async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    const { username, email, password, first_name, last_name } = req.body;
  
    try {
      // Проверяем, существует ли пользователь
      const userCheck = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [
        email,
        username,
      ]);
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ message: 'User with this email or username already exists' });
      }
  
      // Хэшируем пароль
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
  
      // Сохраняем пользователя в базу данных
      const newUser = await pool.query(
        'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, first_name, last_name',
        [username, email, passwordHash, first_name, last_name]
      );
  
      res.status(201).json({ message: 'User registered', user: newUser.rows[0] });
    } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error during registration:', error.message);
        } else {
          console.error('An unknown error occurred');
        }
        res.status(500).json({ message: 'Server error' });
      }
  });
  
export default router;