"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../models/index"));
const token_1 = require("../utils/token");
async function addUser(req, res) {
    try {
        const response = await index_1.default.User.create(req.body);
        const token = (0, token_1.tokenGenerator)(response?.id, response?.username);
        res.status(201).send({ ...response, token });
    }
    catch (err) {
        console.error('Could not add user::', err);
        res.status(500).send();
    }
}
async function getOneUser(req, res) {
    try {
        const response = await index_1.default.User.findOne({
            where: { username: req.params.id },
        });
        const token = (0, token_1.tokenGenerator)(response?.id || '', response?.username || '');
        res.status(200).send({ ...response, token });
    }
    catch (err) {
        console.error('Could not get user::', err);
        res.status(500).send();
    }
}
async function getUserDetails(req, res) {
    try {
        const response = await index_1.default.User.findOne({
            where: { id: req.params.id },
        });
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Could not get user details::', err);
        res.status(500).send();
    }
}
async function getAllUsers(req, res) {
    try {
        const response = await index_1.default.User.findAll();
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Could not get users::', err);
        res.status(500).send();
    }
}
async function changeUsername(req, res) {
    try {
        const response = await index_1.default.User.update({ username: req.body.newUsername }, { where: { id: req.body.id } });
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Could not change username::', err);
        res.status(500).send();
    }
}
async function changePassword(req, res) {
    try {
        const response = await index_1.default.User.update({ password: req.body.newPassword }, { where: { id: req.body.id } });
        res.status(200).send(response);
    }
    catch (err) {
        console.error('Could not change password::', err);
        res.status(500).send();
    }
}
async function getUserId(req, res) {
    try {
        const response = req.userId;
        res.status(200).send(response);
    }
    catch (err) {
        console.error('failed to get user id::', err);
        res.status(500).send();
    }
}
exports.default = {
    addUser,
    getOneUser,
    getAllUsers,
    changeUsername,
    changePassword,
    getUserId,
    getUserDetails,
};
