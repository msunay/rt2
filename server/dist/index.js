"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quiz = exports.peers = exports.io = exports.server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const router_1 = __importDefault(require("./router"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const peers_socket_controller_1 = __importDefault(require("./controllers/peers.socket.controller"));
const quiz_socket_controller_1 = __importDefault(require("./controllers/quiz.socket.controller"));
const app = (0, express_1.default)();
const corsOrigin = process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN
    : 'http://localhost:3000';
const corsOptions = {
    origin: corsOrigin,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(router_1.default);
exports.server = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(exports.server, {
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? process.env.CORS_ORIGIN
            : 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});
exports.peers = exports.io.of('/mediasoup');
exports.quiz = exports.io.of('/quizspace');
exports.peers.on('connection', peers_socket_controller_1.default);
exports.quiz.on('connection', quiz_socket_controller_1.default);
exports.default = app;
