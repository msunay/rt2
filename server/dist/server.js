"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const db_1 = __importDefault(require("./db"));
(async () => {
    await db_1.default.sync().then(() => console.log("Connected to the database"));
    index_1.default.listen(3001);
    console.log("Server running on port 3001");
})();
