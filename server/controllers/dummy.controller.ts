import models from "../models/index";
import { Request, Response } from "express";

const addUser = async (req: Request, res: Response) => {
  try {
    const response = await models.User.create({
      email: "test@test.test",
      username: "testerman",
      password: "testword",
      isPremiumMember: false,
      pointsWon: 0,
    });
    res.status(201).send(response);
  } catch (err) {
    console.error("failed to add user:", err);
  }
};

export default {
  addUser,
};
