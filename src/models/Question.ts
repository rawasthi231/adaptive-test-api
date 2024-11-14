import mongoose from "mongoose";

export interface IQuestion {
  id: string;
  content: string;
  difficulty: number;
  weight: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const questionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    weight: {
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
