import models from "../models/index";
import { Request, Response } from "express";
import { Participation } from "../models/reference_tables/Participation";
import { Quiz } from "../models/objects/Quiz";
import { Op } from 'sequelize';

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
    console.error("Could not get quizzes::", err);
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
    console.error("Could not get quizzes::", err);
    res.status(500).send();
  }
}

async function getAllQuizzes(req: Request, res: Response) {
  try {
    const response = await models.Quiz.findAll();
    res.status(200).send(response);
  } catch (err) {
    console.error("Could not get quizzes::", err);
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
    console.error("Could not get quizzes::", err);
    res.status(500).send();
  }
}

async function getNextQuizForUser (req:Request, res: Response) {
  try {
    const userId = req.params.userId;
    const participations = await Participation.findAll({
      where: { UserId: userId }
    });
    const quizIds = participations.map(p => p.QuizId);
    const upcomingQuizzes = await Quiz.findAll({
      where: {
          id: quizIds,
          dateTime: { [Op.gt]: new Date() }
      }
    });
    upcomingQuizzes.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
    const nextQuiz = upcomingQuizzes[0];
    if (nextQuiz) {
      res.json(nextQuiz);
    } else {
      res.status(404).json({ message: "No upcoming quizzes found for the user." });
    }
  } catch (err) {
    console.error("Could not get quiz::", err);
    res.status(500).send();
  }
}

export default {
  getAllQuizzes,
  getQuizzesQuestionsAnswers,
  getOneQuizQuestionAnswers,
  getOneQuiz,
  getNextQuizForUser
};
