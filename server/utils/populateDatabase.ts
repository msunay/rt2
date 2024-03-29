import models from '../models/index';
import moment from 'moment';
import mocks from './mocks';
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

async function addMockUsers() {
  try {
    mocks.hosts.forEach(async (host) => {
      await models.User.create(host);
    });

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
      let isPrivate;
      if (Math.round(Math.random()) === 0) isPrivate = false
      else isPrivate = true
      const quiz = await models.Quiz.create({
        id: mocks.quizIdArray[i],
        quizName: `Mock Quiz ${i}`,
        quizOwner: mocks.hosts[Math.round(Math.random() * (mocks.hosts.length - 1))].id,
        category: mocks.categories[Math.round(Math.random() * (mocks.categories.length - 1))],
        dateTime: moment().add(i + 1, 'days').toDate(),
        isPrivate
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
            answerNumber: j - 1
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

export default populateDatabase;