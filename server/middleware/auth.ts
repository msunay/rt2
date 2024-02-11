import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const SECRET_KEY: Secret = "SECRET_KEY_TOKEN";

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
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error();
    }

    const tokenObject = jwt.decode(token) as Token;
    const decoded = jwt.verify(token, SECRET_KEY);
//NOTE what is quiz id doing here
    (req as CustomRequest).userId = tokenObject.id;
    (req as CustomRequest).username = tokenObject.username;
    (req as CustomRequest).token = decoded;
    (req as CustomRequest).quizId = req.body.quizId;

    next();
  } catch (err) {
    res.status(401).send("Please authenticate");
  }
};
