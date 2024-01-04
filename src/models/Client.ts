import mongoose, { Schema, Document } from "mongoose";

interface ClientDoc extends Document {
  _id: string;
  password: string;
  salt: string;
  email: String;
  fullName: String;
  depositAmount: Number;
  ledgerId: [String];
  username: String;
}

const ClientSchema = new Schema(
  {
    email: { type: String, unique: true },
    username: { type: String },
    depositAmount: { type: Number },
    password: { type: String },
    salt: { type: String },
    ledgerId: { type: [String], ref: "ledger" },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

const Client = mongoose.model<ClientDoc>("client", ClientSchema);

export { Client };
