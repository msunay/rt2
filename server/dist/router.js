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
const referenceTables_controller_2 = __importDefault(require("./controllers/referenceTables.controller"));
const router = express_1.default.Router();
//testing
router.get('/', auth_1.auth, (req, res) => {
    res.status(200).send({ message: 'all good' });
});
// User routes
router.post('/user', user_controller_1.default.addUser);
router.get('/user/:id', user_controller_1.default.getOneUser);
router.get('/userDetails/:id', user_controller_1.default.getUserDetails);
router.get('/users', user_controller_1.default.getAllUsers);
router.put('/username', user_controller_1.default.changeUsername);
router.put('/password', user_controller_1.default.changePassword);
router.get('/userId', auth_1.auth, user_controller_1.default.getUserId);
// Quiz routes
router.get('/quizzesQuestionsAnswers', quiz_controller_1.default.getQuizzesQuestionsAnswers);
router.get('/quizzes', quiz_controller_1.default.getAllQuizzes);
router.get('/quizQuestionAnswer/:id', quiz_controller_1.default.getOneQuizQuestionAnswers);
router.get('/quiz/:id', quiz_controller_1.default.getOneQuiz);
// Reference tables routes
router.post('/participation', referenceTables_controller_1.default.createParticipation);
router.post('/participationAnswer', referenceTables_controller_1.default.createParticipationAnswer);
router.get('/participation/:id', referenceTables_controller_2.default.getOneParticipation);
router.get('/participations/:userId', referenceTables_controller_1.default.getUserParticipations);
router.get('/participationAnswers/:id', referenceTables_controller_1.default.getParticipationAnswers);
router.delete('/participation/:id', referenceTables_controller_1.default.deleteParticipation);
// Reference tables routes
router.post('/participation', referenceTables_controller_1.default.createParticipation);
router.post('/participationAnswer', referenceTables_controller_1.default.createParticipationAnswer);
exports.default = router;
