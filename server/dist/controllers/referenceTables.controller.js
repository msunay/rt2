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
        console.error("Could not create participation::", err);
        res.status(500).send();
    }
}
async function createParticipationAnswer(req, res) {
    try {
        const participationAnswerInstance = await index_1.default.ParticipationAnswer.create({
            AnswerId: req.body.answerId,
            ParticipationId: req.body.participationId,
        });
        res.status(201).send(participationAnswerInstance);
    }
    catch (err) {
        console.error("Could not create participation answer::", err);
        res.status(500).send();
    }
}
exports.default = {
    createParticipation,
    createParticipationAnswer,
};
