import models from '../models/index';
import { Request, response, Response } from 'express';
import { tokenGenerator } from '../utils/token';
import { CustomRequest } from '../middleware/auth';
import { compareSync } from 'bcrypt';

async function addUser(req: Request, res: Response) {
  try {
    const response = await models.User.create(req.body);
    const token = tokenGenerator(response?.id, response?.username);
    res.status(201).send({ ...response, token });
  } catch (err) {
    console.error('Could not add user::', err);
    res.status(500).send();
  }
}

async function getOneUser(req: Request, res: Response) {
  try {
    const response = await models.User.findOne({
      where: { username: req.params.id },
    });
    const token = tokenGenerator(response?.id || '', response?.username || '');
    res.status(200).send({ ...response, token });
  } catch (err) {
    console.error('Could not get user::', err);
    res.status(500).send();
  }
}

async function getUserDetails(req: Request, res: Response) {
  try {
    const response = await models.User.findOne({
      where: { id: req.params.id },
    });
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get user details::', err);
    res.status(500).send();
  }
}

async function getAllUsers(req: Request, res: Response) {
  try {
    const response = await models.User.findAll();
    res.status(200).send(response);
  } catch (err) {
    console.error('Could not get users::', err);
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
    console.error('Could not change username::', err);
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
    console.error('Could not change password::', err);
    res.status(500).send();
  }
}

async function getUserId(req: Request, res: Response) {
  try {
    const response = (req as CustomRequest).userId;
    res.status(200).send(response);
  } catch (err) {
    console.error('failed to get user id::', err);
    res.status(500).send();
  }
}

async function userLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const response = await models.User.findOne({ where: { username: username } });
    const data = response?.dataValues;
    const token = tokenGenerator(data?.id || '', data?.username || '');
    if (data && compareSync(password, data?.password)) {
      res.status(200).send({ username: response.username, id: response.id, token: token });
    } else {
      res.status(404).send('Please provide correct credentials!');
    }
  } catch (err) {
    res.status(500).send(err);
  }
}

export default {
  addUser,
  getOneUser,
  getAllUsers,
  changeUsername,
  changePassword,
  getUserId,
  getUserDetails,
  userLogin
};
