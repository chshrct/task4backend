import { model, Model, Schema } from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  status: 'active' | 'blocked';
  registrationDate: any;
  loginDate: any;
}

const IUserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
      unique: true,
    },
    password: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, required: true },
    loginDate: { type: Date, required: true },
    registrationDate: { type: Date, required: true },
  },
  { collection: 'users', timestamps: true }
);

const UserModel: Model<IUser> = model('user', IUserSchema);

export default UserModel;
