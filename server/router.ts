import express, { Router } from "express";
import userController from "./controllers/user.controller";

const router: Router = express.Router();

router.post("/users", userController.addUser);
router.get("/user/:username", userController.getOneUser);
router.get("/users", userController.getAllUsers);
router.put("/username", userController.changeUsername);
router.put("/password", userController.changePassword);

export default router;
