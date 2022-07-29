import { NextFunction } from 'express';
import { Request, Response } from 'express';
import { generateAuthToken } from '../../auth/jwt';
import { comparePassword, passwordHash } from '../../auth/password-hash';
import { ErrorCode } from '../../error-handler/error-code';
import { ErrorException } from '../../error-handler/error-exception';
import { ulid } from 'ulid';
import UserModel, { IUser } from '../../models/db/user.db';

export default {
  authCheck: (req: Request, res: Response, next: NextFunction) => {
    const tokenData = req.body.tokenData;
    res.send({ id: tokenData._id, email: tokenData.email });
  },
  signUp: async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, password } = req.body;
    const userExists = await UserModel.findOne({ email: email });
    if (!!userExists) {
      return next(new ErrorException(ErrorCode.DuplicateEntityError, { email }));
    }

    const hash = passwordHash(password);
    const newUser: IUser = {
      _id: ulid(),
      email,
      name,
      password: hash,
      status: 'active',
      loginDate: new Date(),
      registrationDate: new Date(),
    };
    const created = await UserModel.create(newUser);
    res.status(200).end();
  },
  signIn: async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    // check if user exists
    const userExists = await UserModel.findOne({ email: email });
    if (!userExists) {
      return next(new ErrorException(ErrorCode.Unauthenticated));
    }
    if (userExists.status === 'blocked') {
      return next(new ErrorException(ErrorCode.Blocked));
    }

    // validate the password
    const validPassword = comparePassword(password, userExists.password);
    if (!validPassword) {
      return next(new ErrorException(ErrorCode.Unauthenticated));
    }
    // update login date
    await UserModel.updateOne({ _id: userExists._id }, { loginDate: new Date() });

    // generate the token
    const token = generateAuthToken(userExists);

    res.send({ id: userExists._id, email: userExists.email, token });
  },
};
