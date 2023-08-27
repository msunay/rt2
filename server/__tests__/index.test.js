/* eslint-disable */
import { initModels } from '../models/associations';
import app, { server } from '../index';
import { Sequelize } from 'sequelize';
import Client from 'socket.io-client';
import mocks from '../utils/mocks';
import supertest from 'supertest';
import dotenv from 'dotenv';
import moment from 'moment';
// import { peerSocket } from '../utils/mockPeersSocketService.ts'

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

describe('Socket io (Quiz Namespace)', () => {
  let quizSocket;

  beforeAll(async () => {
    await sequelize
    .sync()
    .then(() => console.log('Connected to test database'));

  quizSocket = new Client(`http://localhost:3001/quizspace`);

  await quizSocket.on("connect", () => {
    console.log(" Quiz Client connected");
  });

  });
  beforeEach(async () => {
    server.listen(3001, () => {
      console.log(`Test server running on port: 3001`);
    });
  });
  afterEach(async () => {
    server.close();
  });
  afterAll(async () => {
    await quizSocket.close();
  });

  it('server should listen for host start quiz event and emit reveal_answers_host', (done) => {
    quizSocket.on('reveal_answers_host', () => {
      done()
    });
    quizSocket.emit('host_start_quiz');
  });

  it('server should listen for next_question and emit reveal_answers_host back', (done) => {
    quizSocket.on('reveal_answers_host', () => {
      done()
    })
    quizSocket.emit('next_question')
  })
});

describe('Socket io (Peers Namespace)', () => {
  let peerSocket;

  beforeAll(async () => {
    await sequelize
    .sync()
    .then(() => console.log('Connected to test database'));

  peerSocket = new Client(`http://localhost:3001/mediasoup`);

  await peerSocket.on("connect", () => {
    console.log(" Peer Client connected");
  });

  });
  beforeEach(async () => {
    server.listen(3001, () => {
      console.log(`Test server running on port: 3001`);
    });
  });
  afterEach(async () => {
    server.close();
  });
  afterAll(async () => {
    await peerSocket.close();
  });

  it('server should listen for connection_success and send back success data', (done) => {
    peerSocket.on('connection_success', (success) => {
      expect(success.producerAlreadyExists).toBe(false);
      expect(success.socketId.length).toBe(20);
      done();
    })
  })
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
    expect(JSON.parse(response.text)).toHaveLength(5);
  });
});
