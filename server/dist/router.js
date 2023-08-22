"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("./controllers/user.controller"));
const quiz_controller_1 = __importDefault(require("./controllers/quiz.controller"));
const referenceTables_controller_1 = __importDefault(require("./controllers/referenceTables.controller"));
const auth_1 = require("./middleware/auth");
const router = express_1.default.Router();
//testing 
router.get('/', auth_1.auth, (req, res) => {
    res.status(200).send({ message: 'all good' });
});
// User routes
router.post("/users", user_controller_1.default.addUser);
router.get("/user/:username", user_controller_1.default.getOneUser);
router.get("/users", user_controller_1.default.getAllUsers);
router.put("/username", user_controller_1.default.changeUsername);
router.put("/password", user_controller_1.default.changePassword);
// Quiz routes
router.get("/quizzes", quiz_controller_1.default.getAllQuizzes);
router.get("/quiz/:id", quiz_controller_1.default.getOneQuiz);
// Reference tables routes
router.post("/participation", referenceTables_controller_1.default.createParticipation);
router.post("/participationAnswer", referenceTables_controller_1.default.createParticipationAnswer);
exports.default = router;
