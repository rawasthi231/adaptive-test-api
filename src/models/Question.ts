import mongoose from "mongoose";

export interface IQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  difficulty: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
    autoIndex: true, // Development only
    id: true,
  }
);

questionSchema.set("toObject", { virtuals: true });
questionSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id; // Remove `_id`
    delete ret.__v; // Remove `__v`
    return ret;
  },
});

export const Question = mongoose.model<IQuestion>("Question", questionSchema);
