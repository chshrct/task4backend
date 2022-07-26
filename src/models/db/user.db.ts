import { model, Model, Schema } from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  status: 'active' | 'blocked';
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
  },
  { collection: 'user', timestamps: true }
);

export const UserModel: Model<IUser> = model('user', IUserSchema);
