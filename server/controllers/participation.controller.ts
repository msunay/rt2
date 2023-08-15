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

export default {
  createParticipation,
};
