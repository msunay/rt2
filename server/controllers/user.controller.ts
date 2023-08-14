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

async function getOneUser(req: Request, res: Response) {
  try {
    const response = await models.User.findAll({
      where: { username: req.params.username },
    });
    res.status(200).send(response);
  } catch (err) {
    console.error("Could not get user::", err);
    res.status(500).send();
  }
}

async function getAllUsers(req: Request, res: Response) {
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
      { where: { id: req.body.id } }
    );
    res.status(200).send(response);
  } catch (err) {
    console.error("Could not change username::", err);
    res.status(500).send();
  }
}

async function changePassword(req: Request, res: Response) {
  try {
    const response = await models.User.update(
      { password: req.body.newPassword },
      { where: { id: req.body.id } }
    );
    res.status(200).send(response);
  } catch (err) {
    console.error("Could not change password::", err);
    res.status(500).send();
  }
}

export default {
  addUser,
  getOneUser,
  getAllUsers,
  changeUsername,
  changePassword,
};
