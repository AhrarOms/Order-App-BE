import mongoose, { Schema, Document, Model } from "mongoose";

interface PlayCountDoc extends Document {
    playCount: Number;
}

const PlayCountSchema = new Schema(
  {
    playCount: { type: Number },
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

const PlayCount = mongoose.model<PlayCountDoc>("playCount", PlayCountSchema);

export { PlayCount };
