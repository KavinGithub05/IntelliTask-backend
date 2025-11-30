import { Response } from 'express';
import { Task } from '../models/Task.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const listTasks = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.userId;
    if (!ownerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tasks = await Task.find({ ownerId })
      .sort({ priority: -1, dueDate: 1 })
      .lean();
    res.json(tasks);
  } catch (err: any) {
    console.error('List tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = req.userId;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.ownerId.toString() !== ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(task);
  } catch (err: any) {
    console.error('Get task error:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.userId;
    if (!ownerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, dueDate, priority, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const history = [
      `Task "${title}" created on ${new Date().toLocaleString()}`,
    ];

    const task = await Task.create({
      title,
      description: description || '',
      dueDate,
      priority: priority || 'medium',
      status: status || 'to-do',
      ownerId,
      history,
    });

    res.status(201).json(task);
  } catch (err: any) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = req.userId;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.ownerId.toString() !== ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Track history
    const changes: string[] = [];
    for (const key of Object.keys(req.body)) {
      if (key !== '_id' && task[key as keyof typeof task] !== req.body[key]) {
        changes.push(
          `${key} changed to ${req.body[key]} on ${new Date().toLocaleString()}`
        );
      }
    }

    if (changes.length > 0) {
      task.history.push(...changes);
    }

    const updated = await Task.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err: any) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = req.userId;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.ownerId.toString() !== ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await Task.findByIdAndDelete(id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err: any) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
