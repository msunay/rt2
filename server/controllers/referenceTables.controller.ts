import models from '../models/index';
import { Request, Response } from 'express';
import { CustomRequest } from '../middleware/auth';
import { Participation, ParticipationAnswer } from '../models/associations';

async function createParticipation(req: Request, res: Response) {
  try {
    const participationInstance = await models.Participation.create({
      UserId: req.body.userId,
      QuizId: req.body.quizId,
      isPaid: true,
    });
    res.status(201).send(participationInstance);
  } catch (err) {
    console.error('Could not create participation::', err);
    res.status(500).send();
  }
}

async function deleteParticipation(req: Request, res: Response) {
  try {
    const response = await models.Participation.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).send('Successfully deleted participation');
  } catch (err) {
    console.error('Could not delete participation::', err);
    res.status(500).send();
  }
}

async function getUserParticipations(req: Request, res: Response) {
  try {
    const response = await models.Participation.findAll({
      where: {
        UserId: req.params.userId,
      },
    });
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get participations::', err);
    res.status(500).send();
  }
}

async function getQuizParticipationAnswers(req: Request, res: Response) {
  try {
    const response = await models.Participation.findAll({
      where : {
        QuizId: req.params.id,
      },
      include: ParticipationAnswer
    });
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get participations::', err);
    res.status(500).send();
  }
}

async function getOneParticipation(req: Request, res: Response) {
  try {
    const response = await models.Participation.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get participations::', err);
    res.status(500).send();
  }
}

async function createParticipationAnswer(req: Request, res: Response) {
  console.log('participationAnswer: ', req.body);
  try {
    const participationAnswerInstance = await models.ParticipationAnswer.create(
      {
        ParticipationId: req.body.ParticipationId,
        AnswerId: req.body.AnswerId,
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
  deleteParticipation,
  getOneParticipation,
  getQuizParticipationAnswers
};
