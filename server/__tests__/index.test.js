import supertest from 'supertest';
import models from '../models/index';
import { Sequelize } from 'sequelize';
import app from '../index';
import { beforeEach } from 'mocha';

const localTestConnection = [
  `${env.TEST_DB_NAME}`,
  `${env.TEST_DB_USERNAME}`,
  `${env.TEST_DB_PASSWORD}`,
  {
    host: "localhost",

    dialect: "postgres",

    logging: false,
  }
];

const sequelize = new Sequelize(...localTestConnection);

describe('User endpoint tests', () => {
  const request = supertest(app);

  beforeAll(async () => {
    await sequelize.sync().then(() => console.log('Connected to test database'););
  })

  beforeEach(async () => {
    await models.User.truncate();
  })

  it("should add a user", async () => {
    
  })
});
