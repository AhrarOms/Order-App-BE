import mongoose, { Schema, Document } from "mongoose";

interface LedgerDoc extends Document {
    _id: string;
    deposit: Number;

}

const LedgerSchema = new Schema(
  {
    deposit : {type: Number},
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

const Ledger = mongoose.model<LedgerDoc>("ledger", LedgerSchema);

export { Ledger };
