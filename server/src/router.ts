import express, { Router } from "express";
import userController from "@/controllers/user.controller";
import quizController from "@/controllers/quiz.controller";
import participationController from "@/controllers/referenceTables.controller";
import { auth } from "@/middleware/auth";
import referenceTablesController from "@/controllers/referenceTables.controller";
import { addDemoQuiz } from "@/utils/demoQuiz";
import coturnController from "@/controllers/coturnController";
import rateLimit from "express-rate-limit";

const router: Router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

//testing
router.get(
  "/",
  /* auth, */ (req, res) => {
    console.log("all good");
    res.status(200).send({ message: "all good" });
  }
);

// User routes
router.post("/user", authLimiter, userController.addUser);
router.get("/user/:id", auth, userController.getOneUser);
router.get("/userDetails/:id", userController.getUserDetails);
router.get("/users", auth, userController.getAllUsers);
router.put("/username", auth, userController.changeUsername);
router.put("/password", auth, userController.changePassword);
router.get("/userId", auth, userController.getUser);
router.post("/login", authLimiter, userController.userLogin);

// Quiz routes
router.post("/demoQuiz", addDemoQuiz);
router.post("/quiz", quizController.createFullQuiz);
router.get("/quizzesQuestionsAnswers", quizController.getQuizzesQuestionsAnswers);
router.get("/quizzes", quizController.getAllQuizzes);
router.get("/quizQuestionAnswer/:id", quizController.getOneQuizQuestionAnswers);
router.get("/quiz/:id", quizController.getOneQuiz);
router.get("/winners/:quizId", quizController.getWinners);

// Reference tables routes
router.post("/participation", participationController.createParticipation);
router.post("/participationAnswer", participationController.createParticipationAnswer);
router.get("/participation/:userId/:quizId", referenceTablesController.getOneParticipation);
router.get("/participationByPartId/:partId", referenceTablesController.getOneParticipationByPartId);
router.get("/participations/:userId", participationController.getUserParticipations);
router.get("/quizParticipations/:quizId", referenceTablesController.getQuizParticipations);
router.get("/participationAnswers/:id", participationController.getParticipationAnswers);
router.delete("/participation/:userId/:quizId", participationController.deleteParticipation);

// Coturn routes
router.get("/coturn/credentials", coturnController.getTurnCredentials);

export default router;
