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
  comments: string;
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
    requester: { type: Schema.Types.ObjectId, ref: "user" },
    comments: { type: String },
    createdAt: { type: Date, default: Date.now },
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

const RequestTicket = mongoose.model<RequestTicketDoc>(
  "requestTicket",
  RequestTicketSchema
);

export { RequestTicket };
