import mongoose, { Schema, Document, Model } from "mongoose";

interface AdminDoc extends Document {
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  phone: string;
  paid: boolean;
  classId: String;
  slip: String;
  role: String;
  email: String;
  address: String;
  classType: String;
}

const AdminSchema = new Schema(
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

const Admin = mongoose.model<AdminDoc>("admin", AdminSchema);

export { Admin };
