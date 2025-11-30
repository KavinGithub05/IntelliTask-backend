import express from 'express';
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/tasks.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

router.get('/', listTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
