"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../models/index"));
async function createParticipation(req, res) {
    try {
        const participationInstance = await index_1.default.Participation.create({
            UserId: req.body.userId,
            QuizId: req.body.quizId,
            isPaid: true,
        });
        res.status(201).send(participationInstance);
    }
    catch (err) {
        console.error('Could not create participation::', err);
        res.status(500).send();
    }
}
async function deleteParticipation(req, res) {
    try {
        const response = await index_1.default.Participation.destroy({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).send('Successfully deleted participation');
    }
    catch (err) {
        console.error('Could not delete participation::', err);
        res.status(500).send();
    }
}
async function getUserParticipations(req, res) {
    try {
        const response = await index_1.default.Participation.findAll({
            where: {
                UserId: req.params.userId,
            },
        });
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Could not get participations::', err);
        res.status(500).send();
    }
}
async function getOneParticipation(req, res) {
    try {
        const response = await index_1.default.Participation.findOne({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Could not get participations::', err);
        res.status(500).send();
    }
}
async function createParticipationAnswer(req, res) {
    console.log('participationAnswer: ', req.body);
    try {
        const participationAnswerInstance = await index_1.default.ParticipationAnswer.create({
            ParticipationId: req.body.ParticipationId,
            AnswerId: req.body.AnswerId,
        });
        res.status(201).send(participationAnswerInstance);
    }
    catch (err) {
        console.error('Could not create participation answer::', err);
        res.status(500).send();
    }
}
async function getParticipationAnswers(req, res) {
    try {
        const response = await index_1.default.Participation.findAll({
            where: {
                id: req.params.id,
            },
            include: {
                model: index_1.default.Answer,
                as: 'answers',
            },
        });
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Could not get participations::', err);
        res.status(500).send();
    }
}
exports.default = {
    createParticipation,
    createParticipationAnswer,
    getUserParticipations,
    getParticipationAnswers,
    deleteParticipation,
    getOneParticipation
};
