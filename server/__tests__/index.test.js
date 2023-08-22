/* eslint-disable */
import { initModels } from '../models/associations';
import app, { server } from '../index';
import { Sequelize } from 'sequelize';
import Client from 'socket.io-client';
import mocks from '../utils/mocks';
import supertest from 'supertest';
import dotenv from 'dotenv';

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

describe('Socket io integration', () => {
  let clientSocket;

  beforeAll(async () => {
    await sequelize
      .sync()
      .then(() => console.log('Connected to test database'));
  });

  beforeEach(async () => {
    server.listen(3000, () => {
      console.log(`Test server running on port: 3000`);
      clientSocket = new Client(`http://localhost:3000`);
      clientSocket.on('connect', () => {
        console.log('Client connected');
      });
    });
  });

  afterEach(async () => {
    server.close();
  });

  it('should work', async () => {
    expect(4).toEqual(2 + 2);
  });
});

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

  afterAll(async () => {
    await sequelize.close();
  });

  it('should add a user and fetch it by id', async () => {
    let response = await request.get('/users');
    expect(JSON.parse(response.text).length).toBe(0);

    await models.User.create(mocks.players[0]);

    response = await request.get(`/userDetails/${mocks.players[0].id}`);
    expect(JSON.parse(response.text).id).toBe(mocks.players[0].id);
  });

  it('should add several users and fetch them', async () => {
    let response = await request.get('/users');
    expect(JSON.parse(response.text).length).toBe(0);

    mocks.players.forEach(async (player) => {
      await models.User.create(player);
    });

    response = await request.get('/users');
    expect(JSON.parse(response.text).length).toBe(4);
  });
});
