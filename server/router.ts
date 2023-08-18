import express, { Router } from 'express';
import userController from './controllers/user.controller';
import quizController from './controllers/quiz.controller';
import participationController from './controllers/referenceTables.controller';
import { auth } from './middleware/auth';
const router: Router = express.Router();

//testing
router.get('/', auth, (req, res) => {
  res.status(200).send({ message: 'all good' });
});

// User routes
router.post('/users', userController.addUser);
router.get('/user/:username', userController.getOneUser);
router.get('/users', userController.getAllUsers);
router.put('/username', userController.changeUsername);
router.put('/password', userController.changePassword);
router.get('/userId', auth, userController.getUserId);

// Quiz routes
router.get(
  '/quizzesQuestionsAnswers',
  quizController.getQuizzesQuestionsAnswers
);
router.get('/quizzes', quizController.getAllQuizzes);
router.get('/quizQuestionAnswer/:id', quizController.getOneQuizQuestionAnswers);
router.get('/quiz/:id', quizController.getOneQuiz);
// Reference tables routes
router.post(
  '/participation',
  auth,
  participationController.createParticipation
);
router.post(
  '/participationAnswer',
  participationController.createParticipationAnswer
);
router.get(
  '/participations',
  auth,
  participationController.getUserParticipations
);
router.get(
  '/participationAnswers/:id',
  participationController.getParticipationAnswers
);

export default router;
