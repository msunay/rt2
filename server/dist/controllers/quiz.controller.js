"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../models/index"));
async function getQuizzesQuestionsAnswers(req, res) {
    try {
        const response = await index_1.default.Quiz.findAll({
            include: {
                model: index_1.default.Question,
                include: [index_1.default.Answer],
            },
        });
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Could not get quizzes::', err);
        res.status(500).send();
    }
}
async function getOneQuizQuestionAnswers(req, res) {
    try {
        const response = await index_1.default.Quiz.findAll({
            where: { id: req.params.id },
            include: {
                model: index_1.default.Question,
                include: [index_1.default.Answer],
            },
        });
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Could not get quizzes::', err);
        res.status(500).send();
    }
}
async function getAllQuizzes(req, res) {
    try {
        const response = await index_1.default.Quiz.findAll();
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Could not get quizzes::', err);
        res.status(500).send();
    }
}
async function getOneQuiz(req, res) {
    try {
        const response = await index_1.default.Quiz.findAll({
            where: { id: req.params.id },
        });
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Could not get quizzes::', err);
        res.status(500).send();
    }
}
exports.default = {
    getAllQuizzes,
    getQuizzesQuestionsAnswers,
    getOneQuizQuestionAnswers,
    getOneQuiz,
};
