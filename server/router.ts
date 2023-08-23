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

// Quiz routes
router.post('/demoQuiz', addDemoQuiz);
router.get(
  '/quizzesQuestionsAnswers',
  quizController.getQuizzesQuestionsAnswers
);
router.get('/quizzes', quizController.getAllQuizzes);
router.get('/quizQuestionAnswer/:id', quizController.getOneQuizQuestionAnswers);
router.get('/quiz/:id', quizController.getOneQuiz);
// Reference tables routes
router.post('/participation', participationController.createParticipation);
router.post(
  '/participationAnswer',
  participationController.createParticipationAnswer
);
router.get('/participation/:id', referenceTablesController.getOneParticipation);
router.get(
  '/participations/:userId',
  participationController.getUserParticipations
);
router.get(
  '/participationAnswers/:id',
  participationController.getParticipationAnswers
);
router.delete(
  '/participation/:id',
  participationController.deleteParticipation
);

// Reference tables routes
router.post('/participation', participationController.createParticipation);
router.post(
  '/participationAnswer',
  participationController.createParticipationAnswer
);

export default router;
