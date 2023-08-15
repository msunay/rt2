import express, { Router } from "express";
import userController from "./controllers/user.controller";
import quizController from "./controllers/quiz.controller";
import participationController from "./controllers/participation.controller";

const router: Router = express.Router();

// User routes
router.post("/users", userController.addUser);
router.get("/user/:username", userController.getOneUser);
router.get("/users", userController.getAllUsers);
router.put("/username", userController.changeUsername);
router.put("/password", userController.changePassword);

// Quiz routes
router.get("/quizzes", quizController.getAllQuizzes);
router.get("/quiz/:id", quizController.getOneQuiz);

// Participation routes
router.post("/participation", participationController.createParticipation);
export default router;
