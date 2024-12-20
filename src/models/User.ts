import mongoose from "mongoose";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 1 | 2;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      required: true,
      default: 2, // 1 - admin, 2 - user
    },
  },
  {
    timestamps: true,
    autoIndex: true, // Development only
    id: true,
  }
);

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id; // Remove `_id`
    delete ret.__v; // Remove `__v`
    return ret;
  },
});

export const User = mongoose.model<IUser>("User", userSchema);
