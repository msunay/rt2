import models from '../models/index';
import { Request, Response } from 'express';

async function getQuizzesQuestionsAnswers(req: Request, res: Response) {
  try {
    const response = await models.Quiz.findAll({
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
    const response = await models.Quiz.findAll({
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
    const response = await models.Quiz.findAll();
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get quizzes::', err);
    res.status(500).send();
  }
}

async function getOneQuiz(req: Request, res: Response) {
  try {
    const response = await models.Quiz.findAll({
      where: { id: req.params.id },
    });
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get quizzes::', err);
    res.status(500).send();
  }
}

export default {
  getAllQuizzes,
  getQuizzesQuestionsAnswers,
  getOneQuizQuestionAnswers,
  getOneQuiz,
};
