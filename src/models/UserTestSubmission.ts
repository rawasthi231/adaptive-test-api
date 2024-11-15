import mongoose, { Types } from "mongoose";

export interface IUserTest {
  id: string;
  user_test_id: Types.ObjectId;
  question_id: Types.ObjectId;
  answer: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userTestSubmissionSchema = new mongoose.Schema(
  {
    user_test_id: {
      type: Types.ObjectId,
      required: true,
      ref: "UserTest",
    },
    question_id: {
      type: Types.ObjectId,
      required: true,
      ref: "Question",
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    autoIndex: true, // Development only
    id: true,
  }
);

userTestSubmissionSchema.set("toObject", { virtuals: true });
userTestSubmissionSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id; // Remove `_id`
    delete ret.__v; // Remove `__v`
    return ret;
  },
});

export const UserTestSubmission = mongoose.model<IUserTest>(
  "UserTestSubmission",
  userTestSubmissionSchema
);
