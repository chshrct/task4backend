import cors from 'cors';
import express, { Request, Response } from 'express';
import { authMiddleware } from './src/auth/auth.middleware';
import { errorHandler } from './src/error-handler/error-handler';
import { connect } from './src/models/db/mongoose-connection';
import dotenv from 'dotenv';

import Auth from './src/endpoints/auth';
import Users from './src/endpoints/users';

dotenv.config();

const app = express();
app.use(
  cors({
    origin: 'https://itransition-task4-front.herokuapp.com',
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

app.get('/auth-check', authMiddleware, Auth.authCheck);

app.post('/sign-up', Auth.signUp);

app.post('/sign-in', Auth.signIn);

app.get('/users', authMiddleware, Users.getAllUsers);

app.delete('/users', authMiddleware, Users.deleteUsers);

app.put('/users', authMiddleware, Users.updateUsersStatus);

app.use(errorHandler);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Application started on port ${port}!`);
});
