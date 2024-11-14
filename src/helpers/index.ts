import { Types } from "mongoose";

declare global {
  interface String {
    toObjectId(): Types.ObjectId;
  }
}

String.prototype.toObjectId = function (): Types.ObjectId {
  return new Types.ObjectId(this.toString());
};

export const errorResponse = (error: string, status = 500) => {
  return {
    message: "Internal server error",
    status,
    error,
  };
};
