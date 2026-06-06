import { type Options, Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const localConnection: string[] = [
  `${process.env.DB_NAME}`,
  `${process.env.DB_USERNAME}`,
  `${process.env.DB_PASSWORD}`
] as Options[];


const HOST = isProd ? process.env.DB_HOST : undefined;

export const sequelize = new Sequelize(...localConnection, {
    dialect: 'postgres',
    host: HOST,
    benchmark: true,
    logging: (sql: string, timing: number | undefined) => {

      if (sql) {
        const tableQueried = sql.match(/FROM\s(\"\w+\")/)?.[1] ?
          `Query to table ${sql.match(/FROM\s(\"\w+\")/)?.[1]}`
          : sql.match(/table_name\s=\s(\'\w+\')/)?.[1] ?
            `...sequelize config - setup ${sql.match(/table_name\s=\s(\'\w+\')/)?.[1]}`
            : null;

        if (tableQueried) {
          console.log(`\n${tableQueried}\n   QueryTime: ${timing}ms`)

        }
      }
    },
  })

export default sequelize;
