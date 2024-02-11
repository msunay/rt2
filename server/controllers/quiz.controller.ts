import models from '../models/index';
import { Request, Response } from 'express';
import { Op } from 'sequelize';

async function getQuizzesQuestionsAnswers(req: Request, res: Response) {
  try {
    const response = await models.Quiz.findAll({
      where: {
        dateTime: {
          [Op.gte]: Date.now(),
        },
      },
      include: {
        model: models.Question,
        include: [models.Answer],
      },
    });
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get quizzes::', err);
    res.status(500).send();
  }
}

async function getOneQuizQuestionAnswers(req: Request, res: Response) {
  try {
    const response = await models.Quiz.findOne({
      where: { id: req.params.id },
      include: {
        model: models.Question,
        include: [models.Answer],
      },
    });
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get quizzes::', err);
    res.status(500).send();
  }
}

async function getAllQuizzes(req: Request, res: Response) {
  try {
    const response = await models.Quiz.findAll({
      where: {
        dateTime: {
          [Op.gte]: Date.now(),
        },
      },
    });
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get quizzes::', err);
    res.status(500).send();
  }
}

async function getOneQuiz(req: Request, res: Response) {
  try {
    const response = await models.Quiz.findOne({
      where: { id: req.params.id },
    });
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get quiz::', err);
    res.status(500).send();
  }
}

async function getWinners(req: Request, res: Response) {
  try {
    const participationsAndAnswers = await models.Participation.findAll({
      where: {
        QuizId: req.params.quizId,
      },
      include: {
        model: models.Answer,
        as: 'answers',
      },
    });

    const userScores = await Promise.all(
      participationsAndAnswers.map(async (answerSheet) => {
        const user = await models.User.findOne({
          where: {
            id: answerSheet.UserId,
          },
        });
        const score = answerSheet.answers!.reduce(
          (count, answer) => count + (answer.isCorrect ? 1 : 0),
          0
        );
        return { username: user!.username, userScore: score };
      })
    );
    const maxUserScore = Math.max(...userScores.map((item) => item.userScore));
    const winners = userScores.filter(
      (element) => element.userScore === maxUserScore
    );
    res.status(200).send(winners);
  } catch (err) {
    console.error('Could not get winners::', err);
    res.status(500).send();
  }
}

async function createFullQuiz(req: Request, res: Response) {
  try {
    const quiz = await models.Quiz.create({
      quizName: req.body.quizName,
      quizOwner: req.body.quizOwner,
      category: req.body.category,
      dateTime: req.body.dateTime,
    });

    async function createQuestionWithAnswers(
      questionText: string,
      answers: {answerText: string, isCorrect: boolean}[],
      positionInQuiz: number
    ) {
      const question = await models.Question.create({
        questionText,
        positionInQuiz,
      });

      answers.forEach( async (answer, index) => {
        await question.createAnswer({
          answerText: answer.answerText,
          isCorrect: answer.isCorrect,
          answerNumber: index
        });
      });
      await quiz.addQuestion(question);
    }

    for (let i = 0; i < req.body.Questions.length; i++) {
      await createQuestionWithAnswers(
        req.body.Questions[i].questionText,
        req.body.Questions[i].Answers,
        i + 1
      );
    }
    res.status(201).send(quiz)
  } catch (err) {
    console.error('Could not create quiz::', err);
    res.status(500).send();
  }
}

export default {
  getAllQuizzes,
  getQuizzesQuestionsAnswers,
  getOneQuizQuestionAnswers,
  getOneQuiz,
  getWinners,
  createFullQuiz
};
