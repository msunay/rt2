import jwt, { Secret } from 'jsonwebtoken';

const SECRET_KEY: Secret =
  process.env.NODE_ENV === 'production' ? '' : process.env.JWT_SECRET_KEY!; //TODO production secret key

export function tokenGenerator(id: string, username: string): string {
  return jwt.sign({ id: id, username: username }, SECRET_KEY, {
    expiresIn: '7d',
  });
}