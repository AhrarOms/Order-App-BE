import mongoose, { Schema, Document, ObjectId } from "mongoose";
import { UserDoc } from "./User";

interface RequestTicketDoc extends Document {
  reqId: string;
  productName: string;
  quantity: number;
  codeNumber: string;
  sellingPrice: number;
  status: string;
  image: string;
  requester: UserDoc;
  createdAt: Date;
}

const RequestTicketSchema = new Schema(
  {
    reqId: { type: String, unique: true },
    productName: { type: String },
    quantity: { type: Number },
    codeNumber: { type: String },
    sellingPrice: { type: Number },
    status: { type: String },
    image: { type: String },
    requester: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
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

const RequestTicket = mongoose.model<RequestTicketDoc>(
  "requestTicket",
  RequestTicketSchema
);

export { RequestTicket };
