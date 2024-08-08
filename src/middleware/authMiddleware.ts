import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { generalConfig } from '../config/generalConfig';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, generalConfig.jwtSecret as string);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
