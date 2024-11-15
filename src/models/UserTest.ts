import mongoose, { Types } from "mongoose";

export interface IUserTest {
  id: string;
  user_id: Types.ObjectId;
  test_id: Types.ObjectId;
  score: number;
  completed: boolean;
  currentDifficulty: number;
  consecutiveCorrect: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const userTestSchema = new mongoose.Schema(
  {
    user_id: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    test_id: {
      type: Types.ObjectId,
      required: true,
      ref: "Test",
    },
    score: {
      type: Number,
      required: false,
    },
    completed: {
      type: Boolean,
      required: false,
      default: false,
    },
    currentDifficulty: {
      type: Number,
      required: false,
      default: 5, // Default difficulty is 5 for first question in test
    },
    consecutiveCorrect: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
    autoIndex: true, // Development only
    id: true,
  }
);

userTestSchema.set("toObject", { virtuals: true });
userTestSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id; // Remove `_id`
    delete ret.__v; // Remove `__v`
    return ret;
  },
});

export const UserTest = mongoose.model<IUserTest>("UserTest", userTestSchema);
