import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { ulid } from 'ulid';
import { authMiddleware } from './auth/auth.middleware';
import { generateAuthToken } from './auth/jwt';
import { comparePassword, passwordHash } from './auth/password-hash';
import { ErrorCode } from './error-handler/error-code';
import { ErrorException } from './error-handler/error-exception';
import { errorHandler } from './error-handler/error-handler';
import { connect } from './models/db/mongoose-connection';
import { IUser, UserModel } from './models/db/user.db';
import cors from 'cors';

const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
connect();

app.get('/', (req: Request, res: Response) => {
  res.send('Application works!');
});

app.get('/auth-check', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  const tokenData = req.body.tokenData;
  res.send(tokenData);
});

app.get('/users', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
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
});

app.delete('/users', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  req.body.users.forEach(async (id) => {
    await UserModel.deleteOne({ _id: id });
  });

  res.send({ done: true });
});

app.post('/sign-up', async (req: Request, res: Response, next: NextFunction) => {
  const { email, name, password } = req.body;
  // check if user exists
  const userExists = await UserModel.findOne({ email: email });
  if (!!userExists) {
    return next(new ErrorException(ErrorCode.DuplicateEntityError, { email }));
  }

  // generate password hash
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
  res.send({ done: true });
});

app.post('/sign-in', async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  // check if user exists
  const userExists = await UserModel.findOne({ email: email });
  if (!userExists) {
    return next(new ErrorException(ErrorCode.Unauthenticated));
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
});
app.use(errorHandler);

app.listen(8080, () => {
  console.log('Application started on port 8080!');
});
