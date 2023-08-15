import express, { Router } from "express";
import userController from "./controllers/user.controller";
import { auth } from "./middleware/auth";

const router: Router = express.Router();

//testing 
router.get('/', auth, (req, res) => {
  res.status(200).send({ message: 'all good' })
});

router.post("/users", userController.addUser);
router.get("/user/:username", userController.getOneUser);
router.get("/users", userController.getAllUsers);
router.put("/username", userController.changeUsername);
router.put("/password", userController.changePassword);

export default router;
