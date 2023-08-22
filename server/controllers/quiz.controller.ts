import models from "../models/index";
import { Request, Response } from "express";
import { QueryTypes } from 'sequelize';
import { sequelize } from "../db";

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

    const [quiz] = await sequelize.query(
      `SELECT "Quizzes"."id", "Quizzes"."quizName", "Quizzes"."quizOwner", "Quizzes"."category", "Quizzes"."dateTime", "Users"."username" AS "host_name"
      FROM "Participations"
      JOIN "Quizzes" ON "Participations"."QuizId" = "Quizzes"."id"
      JOIN "Users" ON "Quizzes"."quizOwner" = "Users"."id"
      WHERE "Participations"."UserId" = :userId AND "Quizzes"."dateTime" > NOW()
      ORDER BY "Quizzes"."dateTime" ASC LIMIT 1`,
      {
        replacements: { userId: userId },
        type: QueryTypes.SELECT,
      }
    );

    if (quiz) {
      res.json(quiz);
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
