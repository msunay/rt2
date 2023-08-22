import { Options, Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const env = process.env;

const cloudConnection = [env.DATABASE_URL] as Options[];

const localConnection = [
  `${env.DB_NAME}`,
  `${env.DB_USERNAME}`,
  `${env.DB_PASSWORD}`,
  {

    dialect: "postgres",

    logging: false,
  }
] as Options[];

const connection = env.NODE_ENV === "production" ? cloudConnection : localConnection;

const sequelize = new Sequelize(...connection)

export default sequelize;
