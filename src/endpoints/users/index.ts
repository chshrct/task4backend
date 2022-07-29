import { NextFunction } from 'express';
import { Request, Response } from 'express';
import UserModel from '../../models/db/user.db';

export default {
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    const users = await UserModel.find({});
    const mappedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      regDate: user.registrationDate,
      logDate: user.loginDate,
      status: user.status,
    }));
    res.send(mappedUsers);
  },
  updateUsersStatus: async (req: Request, res: Response, next: NextFunction) => {
    await UserModel.updateMany({ _id: { $in: req.body.users } }, { $set: { status: req.body.status } });
    const dbUsers = await UserModel.find({});
    const users = dbUsers.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      regDate: user.registrationDate,
      logDate: user.loginDate,
      status: user.status,
    }));
    res.send(users);
  },
  deleteUsers: async (req: Request, res: Response, next: NextFunction) => {
    await UserModel.deleteMany({ _id: { $in: req.body.users } });

    res.status(200).end();
  },
};
