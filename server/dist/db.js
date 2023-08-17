"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const env = process.env;
const cloudConnection = [env.DATABASE_URL];
const localConnection = [
    `${env.DB_NAME}`,
    `${env.DB_USERNAME}`,
    `${env.DB_PASSWORD}`,
    {
        host: "localhost",
        dialect: "postgres",
        logging: false,
    }
];
const connection = env.NODE_ENV === "production" ? cloudConnection : localConnection;
const sequelize = new sequelize_1.Sequelize(...connection);
exports.default = sequelize;
