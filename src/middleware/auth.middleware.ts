import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = header.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.userId = payload.id;
    req.user = payload;
    next();
  } catch (err: any) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
