import models from '../models/index';
import moment from 'moment';
/*
  The following function populates the database with 5 users (1 host and 4 players) and 4 quizzes.
  The host user will be the owner of all 4 quizzes and the players are generated without any participations.
  The quiz has 10 questions associated with it.
  Each question has 4 answers associated with it.
  TO GET THE DATA:
  1. Clear your database tables.
  2. Open the terminal and start the server.
  3. From another terminal tab "cd" into the server folder.
  4. Run the command: "ts-node controllers/populateDatabase.ts"
  5. You will see the log "Database populated" -> this means it was successful.
*/
const mocks = {
  hosts: [
    {
      id: '0cf7cbe4-0c52-4a1a-940a-65d47f769c08',
      email: 'mock@host.com',
      username: 'jimmyHost',
      password: '$2a$10$72VY7l.IIX49MmRSGNj8aebXRXyDyWkZyRU8DKl4gchKam410AJyK',
      isPremiumMember: true,
      pointsWon: 0,
    },
  ],
  players: [
    {
      id: 'efde9495-1ec4-4c7d-b344-b68000c00291',
      email: 'dave@email.com',
      username: 'dave',
      password: '$2a$10$72VY7l.IIX49MmRSGNj8aebXRXyDyWkZyRU8DKl4gchKam410AJyK',
      isPremiumMember: false,
      pointsWon: 0,
    },
    {
      id: '67136c1f-573e-4f57-a403-91719b98584e',
      email: 'mike@email.com',
      username: 'mike',
      password: '$2a$10$72VY7l.IIX49MmRSGNj8aebXRXyDyWkZyRU8DKl4gchKam410AJyK',
      isPremiumMember: false,
      pointsWon: 0,
    },
    {
      id: '78b9e627-c22b-495e-973f-5aa0bd95a525',
      email: 'john@email.com',
      username: 'john',
      password: '$2a$10$72VY7l.IIX49MmRSGNj8aebXRXyDyWkZyRU8DKl4gchKam410AJyK',
      isPremiumMember: false,
      pointsWon: 0,
    },
    {
      id: '87363573-d48f-43e9-81a0-3d64af38380b',
      email: 'kevin@email.com',
      username: 'kevin',
      password: '$2a$10$72VY7l.IIX49MmRSGNj8aebXRXyDyWkZyRU8DKl4gchKam410AJyK',
      isPremiumMember: false,
      pointsWon: 0,
    },
  ],
  quizIdArray: [
    '98e03864-eec4-4800-941c-4b1dbe78301f',
    'fb5a9d14-f083-4ec3-9d7c-05b920a250fd',
    '7e3ad734-fd07-45d4-acf9-3d12b05bcb19',
    'd0da9fc4-d186-4186-bf32-d0bb2fad1f8f',
    '690c7980-336d-4ee6-ab92-8edb832b174d',
  ],
};
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
        dateTime: moment().add(5, 'days').toDate(),
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
    console.error("Failed to populate database::",err);
  }
}
populateDatabase();