import { Options, Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const cloudConnection = [
  `${process.env.DB_NAME}`,
  `${process.env.DB_USERNAME}`,
  `${process.env.DB_PASSWORD}`
] as Options[];

const localConnection = [
  `${process.env.DB_NAME}`,
  `${process.env.DB_USERNAME}`,
  `${process.env.DB_PASSWORD}`
] as Options[];

const connection =
  process.env.NODE_ENV === 'production' ? cloudConnection : localConnection;

const HOST = process.env.NODE_ENV === 'production' ? '/var/run/postgresql' : undefined;
export const sequelize = new Sequelize(...connection, {
  dialect: 'postgres',
  host: HOST,
  logging: console.log,
});

export default sequelize;
