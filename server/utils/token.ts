import jwt from 'jsonwebtoken';
const TOKEN_KEY = 'SECRET_KEY_TOKEN'

export function tokenGenerator(id: string, username: string): string {
  return jwt.sign({ id: id, username: username }, TOKEN_KEY, {
    expiresIn: '7d',
  });
}