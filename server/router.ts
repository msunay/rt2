import express, { Router } from "express";
import userController from "./controllers/user.controller";

const router: Router = express.Router();

router.post("/users", userController.addUser);
router.get("/users", userController.getUsers);
router.put("/username", userController.changeUsername);

export default router;
