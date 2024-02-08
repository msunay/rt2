import express, { Router } from 'express';
import userController from './controllers/user.controller';
import quizController from './controllers/quiz.controller';
import participationController from './controllers/referenceTables.controller';
import { auth } from './middleware/auth';
import referenceTablesController from './controllers/referenceTables.controller';
import { addDemoQuiz } from './utils/demoQuiz';
const router: Router = express.Router();

//testing
router.get('/', auth, (req, res) => {
  res.status(200).send({ message: 'all good' });
});

// User routes
router.post('/user', userController.addUser);
router.get('/user/:id', userController.getOneUser);
router.get('/userDetails/:id', userController.getUserDetails);
router.get('/users', userController.getAllUsers);
router.put('/username', userController.changeUsername);
router.put('/password', userController.changePassword);
router.get('/userId', auth, userController.getUserId);
router.post('/login', userController.userLogin);

// Quiz routes
router.post('/demoQuiz', addDemoQuiz);
router.post('/quiz', quizController.createFullQuiz);
router.get(
  '/quizzesQuestionsAnswers',
  quizController.getQuizzesQuestionsAnswers
);
router.get('/quizzes', quizController.getAllQuizzes);
router.get('/quizQuestionAnswer/:id', quizController.getOneQuizQuestionAnswers);
router.get('/quiz/:id', quizController.getOneQuiz);
router.get('/winners/:quizId', quizController.getWinners);

// Reference tables routes
router.post('/participation', participationController.createParticipation);
router.post(
  '/participationAnswer',
  participationController.createParticipationAnswer
);
router.get(
  '/participation/:userId/:quizId',
  referenceTablesController.getOneParticipation
);
router.get(
  '/participationByPartId/:partId',
  referenceTablesController.getOneParticipationByPartId
);
router.get(
  '/participations/:userId',
  participationController.getUserParticipations
);
router.get(
  '/quizParticipations/:quizId',
  referenceTablesController.getQuizParticipations
);
router.get(
  '/participationAnswers/:id',
  participationController.getParticipationAnswers
);
router.delete(
  '/participation/:userId/:quizId',
  participationController.deleteParticipation
);

// Reference tables routes
router.post('/participation', participationController.createParticipation);
router.post(
  '/participationAnswer',
  participationController.createParticipationAnswer
);

export default router;
