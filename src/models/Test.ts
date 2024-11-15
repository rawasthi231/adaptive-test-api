import mongoose, { Types } from "mongoose";

export interface ITest {
  id: string;
  questions: Array<Types.ObjectId> | string[];
  url: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const testSchema = new mongoose.Schema(
  {
    questions: {
      type: Array<Types.ObjectId>,
      required: true,
      ref: "Question",
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    autoIndex: true, // Development only
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
