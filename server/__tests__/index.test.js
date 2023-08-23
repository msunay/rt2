/* eslint-disable */
import { initModels } from '../models/associations';
import app, { server } from '../index';
import { Sequelize } from 'sequelize';
import Client from 'socket.io-client';
import mocks from '../utils/mocks';
import supertest from 'supertest';
import dotenv from 'dotenv';
import moment from 'moment';

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
async function addMockUsers() {
  try {
    await models.User.create(mocks.hosts[0]);

    mocks.players.forEach(async (player) => {
      await models.User.create(player);
    });
    console.log('Successfully added users to database');
  } catch (err) {
    console.error('Failed to add users to database::', err);
  }
}
async function populateDatabase() {
  try {
    await addMockUsers();
    // Create the quiz
    for (let i = 0; i < mocks.quizIdArray.length; i++) {
      const quiz = await models.Quiz.create({
        id: mocks.quizIdArray[i],
        quizName: `Mock Quiz ${i}`,
        quizOwner: mocks.hosts[0].id,
        category: 'General Knowledge',
        dateTime: moment().add(i, 'days').toDate(),
      });

      // Create questions and answers
      for (let i = 1; i <= 10; i++) {
        const question = await models.Question.create({
          questionText: `Question ${i}`,
          positionInQuiz: i,
        });

        // Associate the question with the quiz
        await quiz.addQuestion(question);

        // Create 4 answers for each question
        const correctIndex = Math.floor(Math.random() * 4) + 1;
        for (let j = 1; j <= 4; j++) {
          const isCorrect = j === correctIndex;
          await question.createAnswer({
            answerText: `Answer ${j} for Question ${i}`,
            isCorrect,
          });
        }
      }
    }
    console.log('Database populated');
  } catch (err) {
    console.error('Failed to populate database::', err);
  }
}

describe('Socket io integration', () => {
  let clientSocket;
  beforeAll(async () => {
    await sequelize
      .sync()
      .then(() => console.log('Connected to test database'));
  });
  beforeEach(async () => {
    server.listen(3001, () => {
      console.log(`Test server running on port: 3001`);
      clientSocket = new Client(`http://localhost:3001`);
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
    await models.User.destroy({ where: {} });
  });
  afterEach(async () => {
    await models.User.destroy({ where: {} });
  });

  it('should add a user and fetch it by id', async () => {
    let response = await request.get('/users');
    expect(JSON.parse(response.text)).toHaveLength(0);

    await models.User.create(mocks.players[0]);

    response = await request.get(`/userDetails/${mocks.players[0].id}`);
    expect(JSON.parse(response.text).id).toBe(mocks.players[0].id);
  });

  it('should add several users and fetch them', async () => {
    let response = await request.get('/users');
    expect(JSON.parse(response.text)).toHaveLength(0);

    mocks.players.forEach(async (player) => {
      await models.User.create(player);
    });

    response = await request.get('/users');
    expect(JSON.parse(response.text)).toHaveLength(4);
  });
});

describe('Quiz endpoint tests', () => {
  const request = supertest(app);
  beforeAll(async () => {
    await sequelize
      .sync()
      .then(() => console.log('Connected to test database'));
    await models.Quiz.destroy({ where: {} });
    await models.Question.destroy({ where: {} });
    await models.Answer.destroy({ where: {} });
    await models.User.destroy({ where: {} });
    await populateDatabase();
  });
  afterEach(async () => {
    await models.Quiz.destroy({ where: {} });
    await models.Question.destroy({ where: {} });
    await models.Answer.destroy({ where: {} });
    await models.User.destroy({ where: {} });
    await populateDatabase();
  });

  it('should create a quiz with associated Qs and As, and fetch it by quiz id', async () => {
    const response = await request.get(
      `/quizQuestionAnswer/${mocks.quizIdArray[0]}`
    );
    expect(JSON.parse(response.text)[0].quizName).toBe('Mock Quiz 0');
  });

  it('should fetch all quiz details', async () => {
    const response = await request.get('/quizzes');
    console.log('RESPONSE', JSON.parse(response.text));
    expect(JSON.parse(response.text)).toHaveLength(5);
  });
});
