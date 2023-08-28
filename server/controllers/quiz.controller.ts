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

export default {
  getAllQuizzes,
  getQuizzesQuestionsAnswers,
  getOneQuizQuestionAnswers,
  getOneQuiz,
};
