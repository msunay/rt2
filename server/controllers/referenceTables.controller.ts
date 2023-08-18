import models from '../models/index';
import { Request, Response } from 'express';
import { CustomRequest } from '../middleware/auth';

async function createParticipation(req: Request, res: Response) {
  try {
    const participationInstance = await models.Participation.create({
      UserId: (req as CustomRequest).userId,
      QuizId: (req as CustomRequest).quizId,
      isPaid: true,
    });
    res.status(201).send(participationInstance);
  } catch (err) {
    console.error('Could not create participation::', err);
    res.status(500).send();
  }
}

async function getUserParticipations(req: Request, res: Response) {
  try {
    const response = await models.Participation.findAll({
      where: {
        UserId: (req as CustomRequest).userId,
      },
    });
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get participations::', err);
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
    console.error('Could not create participation answer::', err);
    res.status(500).send();
  }
}

async function getParticipationAnswers(req: Request, res: Response) {
  try {
    const response = await models.Participation.findAll({
      where: {
        id: req.params.id,
      },
      include: {
        model: models.Answer,
        as: 'answers',
      },
    });
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get participations::', err);
    res.status(500).send();
  }
}

export default {
  createParticipation,
  createParticipationAnswer,
  getUserParticipations,
  getParticipationAnswers,
};
