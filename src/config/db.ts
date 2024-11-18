import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("DB connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export const disConnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("DB disconnected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
