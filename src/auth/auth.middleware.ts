import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/db/user.db';
import { ErrorCode } from '../error-handler/error-code';
import { ErrorException } from '../error-handler/error-exception';
import { verifyToken } from './jwt';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer')) {
    const token = auth.slice(7);

    try {
      const tokenData = verifyToken(token);

      const userExists = await UserModel.findOne({ _id: tokenData._id });
      if (!userExists) {
        return next(new ErrorException(ErrorCode.Unauthenticated));
      }
      if (userExists.status === 'blocked') {
        return next(new ErrorException(ErrorCode.Blocked));
      }

      req.body.tokenData = tokenData;
      next();
    } catch (error) {
      return next(new ErrorException(ErrorCode.Unauthenticated));
    }
  } else {
    return next(new ErrorException(ErrorCode.Unauthenticated));
  }
};
