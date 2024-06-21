import { Options, Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const cloudConnection = [
  `${process.env.DB_NAME}`,
  `${process.env.DB_USERNAME}`,
  `${process.env.DB_PASSWORD}`
] as Options[];

const flyConnectionString = process.env.DATABASE_URL

const localConnection = [
  `${process.env.DB_NAME}`,
  `${process.env.DB_USERNAME}`,
  `${process.env.DB_PASSWORD}`
] as Options[];


const HOST = isProd ? process.env.DB_HOST : undefined;

export const sequelize = new Sequelize(flyConnectionString!, {
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

// export const sequelize = new Sequelize(...localConnection, {
//   dialect: 'postgres',
//   host: HOST,
//   benchmark: true,
//   logging: (msg: string, queryTime: string) => {

//     if (msg) {
//       const tableQueried = msg.match(/FROM\s(\"\w+\")/)?.[1] ?
//         `Query to table ${msg.match(/FROM\s(\"\w+\")/)?.[1]}`
//         : msg.match(/table_name\s=\s(\'\w+\')/)?.[1] ?
//           `...sequelize config - setup ${msg.match(/table_name\s=\s(\'\w+\')/)?.[1]}`
//           : null;

//       if (tableQueried) {
//         console.log(`\n${tableQueried}\n   QueryTime: ${queryTime}ms`)

//       }
//     }
//   },
// });

export default sequelize;
