import mongoose, { Schema, Document, Model } from "mongoose";

interface LeaderBoardDoc extends Document {
    username: String;
    networth: Number;
}

const LeaderBoardSchema = new Schema(
  {
   username: { type: String },
   networth: { type: Number },
   userId : {
        type: mongoose.Schema.Types.ObjectId,
   }
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

const LeaderBoard = mongoose.model<LeaderBoardDoc>("LeaderBoard", LeaderBoardSchema);

export { LeaderBoard };
