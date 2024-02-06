import mongoose, { Schema, Document } from "mongoose";
import { UserDoc } from "./User";

interface LogDoc extends Document {
  requestId: string;
  pastStatus: string;
  currentStatus: string;
  user: UserDoc;
  createdAt: Date;
}

const LogSchema = new Schema(
  {
    requestId: { type: Schema.Types.ObjectId, ref: "requestTicket" },
    pastStatus: { type: String },
    currentStatus: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "user" },
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

const Log = mongoose.model<LogDoc>("log", LogSchema);

export { Log };
