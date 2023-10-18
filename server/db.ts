import { Options, Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const env = process.env;

const cloudConnection = [env.DATABASE_URL] as Options[];

const localConnection = [
  `${env.DB_NAME}`,
  `${env.DB_USERNAME}`,
  `${env.DB_PASSWORD}`
] as Options[];

const connection =
  env.NODE_ENV === 'production' ? cloudConnection : localConnection;

export const sequelize = new Sequelize(...connection, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  host: 'host.docker.internal',
  logging: false,
});

export default sequelize;
