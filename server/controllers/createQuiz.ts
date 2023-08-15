import models from "../models/index";
import moment from "moment";

async function createBasicQuiz() {
  // Create the quiz
  const quiz = await models.Quiz.create({
    quizName: "Basic General Knowledge Quiz",
    quizOwner: "dbd24314-d429-4041-b9b2-1441da34caf0",
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

  return quiz;
}

createBasicQuiz().then(() => {
  console.log("Quiz created and sent to the database");
});
