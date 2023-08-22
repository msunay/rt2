"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const db_1 = __importDefault(require("./db"));
const PORT = 3001;
(async () => {
    await db_1.default.sync().then(() => console.log('Connected to the database'));
    index_1.server.listen(PORT);
    console.log(`Server running on ${process.env.NODE_ENV === 'production'
        ? process.env.CORS_ORIGIN
        : `http://localhost:${PORT}`}`);
})();
