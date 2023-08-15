import models from "../models/index";
import moment from "moment";

/*
  The following function populates the database with 2 users and one quiz.
  The host user will be the owner of the quiz and the player user is a participant in the quiz. 
  The quiz has 10 questions associated with it.
  Each question has 4 answers associated with it.

  TO GET THE DATA:

  1. Clear your database tables.
  2. Open the terminal and start the server.
  3. From another terminal tab "cd" into the server folder.
  4. Run the command: "ts-node controllers/populateDatabase.ts"
  5. You will see the log "Database populated" -> this means it was successful.
*/

const mockHost = {
  id: "0cf7cbe4-0c52-4a1a-940a-65d47f769c08",
  email: "host@email.com",
  username: "hostname",
  password: "$2a$10$72VY7l.IIX49MmRSGNj8aebXRXyDyWkZyRU8DKl4gchKam410AJyK",
  isPremiumMember: false,
  pointsWon: 0,
};

const mockPlayer = {
  id: "efde9495-1ec4-4c7d-b344-b68000c00291",
  email: "player@email.com",
  username: "playername",
  password: "$2a$10$72VY7l.IIX49MmRSGNj8aebXRXyDyWkZyRU8DKl4gchKam410AJyK",
  isPremiumMember: false,
  pointsWon: 0,
};

async function populateDatabase() {
  // Add 2 users -> one player and one host
  await models.User.create(mockHost);
  await models.User.create(mockPlayer);

  // Create the quiz
  const quiz = await models.Quiz.create({
    quizName: "Mock Quiz",
    quizOwner: mockHost.id,
    category: "General Knowledge",
    dateTime: moment().add(5, "days").toDate(),
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
  // Create participation between player and quiz
  await models.Participation.create({
    UserId: mockPlayer.id,
    QuizId: quiz.id,
    isPaid: true,
  });
  console.log("Database populated");
}

populateDatabase();
