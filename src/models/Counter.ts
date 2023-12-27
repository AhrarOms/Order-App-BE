// create model for counter to keep track of no of requet tickets

import mongoose, { Schema, Document } from "mongoose";

interface CounterDoc extends Document {
  seq: number;
  name: string;
}

const CounterSchema = new Schema(
  {
    seq: { type: Number, default: 0 },
    name: { type: String },
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

const Counter = mongoose.model<CounterDoc>("counter", CounterSchema);

export { Counter };
