import express, { Request, Response } from 'express';
import pool from '../db.js'; // Подключение к базе данных
import { authenticateToken } from '../authMiddleware.js';

const router = express.Router();

interface CreateTaskBody {
  title: string;
  description?: string;
  priority?: string; // 'high', 'medium', 'normal', 'low'
  due_date?: string; // Формат даты в ISO
}

router.post('/:teamId/tasks', authenticateToken, async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { title, description, priority, due_date } = req.body as CreateTaskBody;
  const creatorId = req.body.userId; // ID текущего пользователя из токена

  try {
    // Проверяем, существует ли команда
    const teamCheck = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
    if (teamCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Создаем задачу
    const newTask = await pool.query(
      `INSERT INTO tasks (title, description, priority, due_date, creator_id, team_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description || null, priority || 'normal', due_date || null, creatorId, teamId]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: newTask.rows[0],
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:teamId/tasks', authenticateToken, async (req: Request, res: Response) => {
    const { teamId } = req.params;
  
    try {
      // Проверяем, существует ли команда
      const teamCheck = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
      if (teamCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Team not found' });
      }
  
      // Получаем задачи команды
      const tasks = await pool.query('SELECT * FROM tasks WHERE team_id = $1', [teamId]);
  
      res.status(200).json({
        message: 'Tasks fetched successfully',
        tasks: tasks.rows,
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  interface UpdateTaskBody {
    title?: string;
    description?: string;
    priority?: string;
    status?: string; // 'todo', 'in progress', 'completed'
    due_date?: string;
    assigned_to?: number; // ID пользователя
  }
  
  router.put('/:teamId/tasks/:taskId', authenticateToken, async (req: Request, res: Response) => {
    const { teamId, taskId } = req.params;
    const { title, description, priority, status, due_date, assigned_to } = req.body as UpdateTaskBody;
  
    try {
      // Проверяем, существует ли команда
      const teamCheck = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
      if (teamCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Team not found' });
      }
  
      // Проверяем, существует ли задача
      const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1 AND team_id = $2', [
        taskId,
        teamId,
      ]);
      if (taskCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // Обновляем задачу
      const updates = [];
      const values: any[] = [taskId];
      if (title) {
        updates.push(`title = $${values.length + 1}`);
        values.push(title);
      }
      if (description) {
        updates.push(`description = $${values.length + 1}`);
        values.push(description);
      }
      if (priority) {
        updates.push(`priority = $${values.length + 1}`);
        values.push(priority);
      }
      if (status) {
        updates.push(`status = $${values.length + 1}`);
        values.push(status);
      }
      if (due_date) {
        updates.push(`due_date = $${values.length + 1}`);
        values.push(due_date);
      }
      if (assigned_to) {
        updates.push(`assigned_to = $${values.length + 1}`);
        values.push(assigned_to);
      }
  
      if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }
  
      const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
      const updatedTask = await pool.query(query, values);
  
      res.status(200).json({
        message: 'Task updated successfully',
        task: updatedTask.rows[0],
      });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.delete('/:teamId/tasks/:taskId', authenticateToken, async (req: Request, res: Response) => {
    const { teamId, taskId } = req.params;
  
    try {
      // Проверяем, существует ли команда
      const teamCheck = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
      if (teamCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Team not found' });
      }
  
      // Проверяем, существует ли задача
      const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1 AND team_id = $2', [
        taskId,
        teamId,
      ]);
      if (taskCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // Удаляем задачу
      await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
  
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/:teamId', authenticateToken, async (req, res) => {
    const { teamId } = req.params;
  
    try {
      const tasks = await pool.query('SELECT * FROM tasks WHERE team_id = $1', [teamId]);
      res.status(200).json({ tasks: tasks.rows });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/', authenticateToken, async (req, res) => {
    const { teamId, sortField = 'created_at', sortOrder = 'asc' } = req.query;
  
    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }
  
    try {
      // Генерируем SQL-запрос с учетом сортировки
      const query = `
        SELECT 
          tasks.id,
          tasks.title,
          tasks.description,
          tasks.priority,
          tasks.status,
          tasks.due_date,
          tasks.created_at,
          tasks.updated_at,
          users.first_name AS creator_first_name,
          users.last_name AS creator_last_name,
          users.avatar_url AS creator_avatar_url
        FROM 
          tasks
        LEFT JOIN 
          users ON tasks.creator_id = users.id
        WHERE 
          tasks.team_id = $1
        ORDER BY 
          ${sortField} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}
      `;
  
      const tasks = await pool.query(query, [teamId]);
      res.json({ tasks: tasks.rows });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  

export default router;
