"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenGenerator = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const TOKEN_KEY = 'SECRET_KEY_TOKEN';
function tokenGenerator(id, username) {
    return jsonwebtoken_1.default.sign({ id: id, username: username }, TOKEN_KEY, {
        expiresIn: '7d',
    });
}
exports.tokenGenerator = tokenGenerator;
