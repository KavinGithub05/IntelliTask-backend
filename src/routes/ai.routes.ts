import express from 'express';
import { suggestPriority } from '../controllers/ai.controller';

const router = express.Router();

router.post('/priority-suggestion', suggestPriority);

export default router;
