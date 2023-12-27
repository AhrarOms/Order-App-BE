import mongoose, { Schema, Document, Model } from "mongoose";

interface UserDoc extends Document {
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  phone: string;
  paid: boolean;
  classId: string;
  slip: string;
  role: string;
  email: string;
  address: string;
  classType: string;
}

const UserSchema = new Schema(
  {
    email: { type: String, unique: true },
    role: { type: String },
    phone: { type: String },
    password: { type: String },
    salt: { type: String },
    firstName: { type: String },
    lastName: { type: String },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const User = mongoose.model<UserDoc>("user", UserSchema);

export { User, UserDoc };
