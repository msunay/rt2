import models from "../models/index";
import { Request, Response } from "express";

async function addUser(req: Request, res: Response) {
  try {
    const response = await models.User.create(req.body);
    res.status(201).send(response);
  } catch (err) {
    console.error("Could not add user::", err);
    res.status(500).send();
  }
}

async function getUsers(req: Request, res: Response) {
  try {
    const response = await models.User.findAll();
    res.status(200).send(response);
  } catch (err) {
    console.error("Could not get users::", err);
    res.status(500).send();
  }
}

async function changeUsername(req: Request, res: Response) {
  try {
    const response = await models.User.update(
      { username: req.body.newUsername },
      { where: { userId: req.body.userId } }
    );
    res.status(200).send(response);
  } catch (err) {
    console.error("Could not get users::", err);
    res.status(500).send();
  }
}



export default {
  addUser,
  getUsers,
  changeUsername
};
