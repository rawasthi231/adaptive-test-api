import mongoose, { Types } from "mongoose";

export interface ITest {
  id: string;
  user_id: mongoose.Types.ObjectId;
  questions: Array<string>;
  score: number;
  completed: boolean;
  currentDifficulty: number;
  consecutiveCorrect: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const testSchema = new mongoose.Schema(
  {
    user_id: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    questions: {
      type: Array<String>,
      required: true,
      nullable: true,
    },
    score: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      required: true,
    },
    currentDifficulty: {
      type: Number,
      required: true,
    },
    consecutiveCorrect: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    autoIndex: true,
    id: true,
  }
);

testSchema.set("toObject", { virtuals: true });
testSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id; // Remove `_id`
    delete ret.__v; // Remove `__v`
    return ret;
  },
});

export const Test = mongoose.model<ITest>("Test", testSchema);
