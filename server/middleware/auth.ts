import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const SECRET_KEY: Secret =
  process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET_KEY! : process.env.JWT_SECRET_KEY!; //TODO production secret key

export interface CustomRequest extends Request {
  token: string | JwtPayload;
  userId: string;
  username: string;
  quizId: string;
}

interface Token {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token');
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    (req as CustomRequest).userId = (decoded as Token).id;
    (req as CustomRequest).username = (decoded as Token).username;
    (req as CustomRequest).token = (decoded as Token);

    next();
  } catch (err) {
    // @ts-ignore
    res.status(401).send({authError: {type: `${err?.name}`, message: `${err?.message}`}});
  }
};
