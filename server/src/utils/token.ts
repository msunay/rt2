import jwt, { Secret } from 'jsonwebtoken';

const SECRET_KEY: Secret = process.env.JWT_SECRET_KEY!;
if (!SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY environment variable is required');
}

export function tokenGenerator(id: string, username: string): string {
  return jwt.sign({ id: id, username: username }, SECRET_KEY, {
    expiresIn: '7d',
  });
}