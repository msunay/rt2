import models from "../models/index";
import { Request, Response } from "express";

async function createParticipation(req: Request, res: Response) {
  try {
    const participationInstance = await models.Participation.create({
      UserId: req.body.userId,
      QuizId: req.body.quizId,
      isPaid: true,
    });
    res.status(201).send(participationInstance);
  } catch (err) {
    console.error("Could not create participation::", err);
    res.status(500).send();
  }
}

async function createParticipationAnswer(req: Request, res: Response) {
  try {
    const participationAnswerInstance = await models.ParticipationAnswer.create(
      {
        AnswerId: req.body.answerId,
        ParticipationId: req.body.participationId,
      }
    );
    res.status(201).send(participationAnswerInstance);
  } catch (err) {
    console.error("Could not create participation answer::", err);
    res.status(500).send();
  }
}

export default {
  createParticipation,
  createParticipationAnswer,
};
