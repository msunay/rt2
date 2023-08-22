import { initModels } from '../models/associations';
import { Sequelize } from 'sequelize';
import mocks from '../utils/mocks';
import supertest from 'supertest';
import dotenv from 'dotenv';
import app from '../index';

dotenv.config();
const env = process.env;

const localTestConnection = [
  `${env.TEST_DB_NAME}`,
  `${env.TEST_DB_USERNAME}`,
  `${env.TEST_DB_PASSWORD}`,
  {
    host: 'localhost',

    dialect: 'postgres',

    logging: false,
  },
];

const sequelize = new Sequelize(...localTestConnection);
const models = initModels(sequelize);

describe('User endpoint tests', () => {
  const request = supertest(app);

  beforeAll(async () => {
    await sequelize
      .sync()
      .then(() => console.log('Connected to test database'));
  });

  afterEach(async () => {
    await models.User.destroy({ where: {} });
  });

  it('should add a user and fetch it by id', async () => {
    let response = await request.get('/users');
    expect(JSON.parse(response.text).length).toBe(0);

    await models.User.create(mocks.players[0]);

    response = await request.get(`/userDetails/${mocks.players[0].id}`);
    console.log('RESPONSE TEXT::', JSON.parse(response.text));
    expect(JSON.parse(response.text).id).toBe(mocks.players[0].id);
  });
});
