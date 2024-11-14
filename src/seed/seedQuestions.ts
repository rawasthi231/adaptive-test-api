import mongoose from "mongoose";

import { config } from "dotenv";

import { Question } from "../models/Question";

config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

const generateRandomQuestions = (numQuestions: number) => {
  const questions = [];

  for (let i = 0; i < numQuestions; i++) {
    const randomDifficulty = Math.floor(Math.random() * 10) + 1; // Difficulty from 1 to 10
    const randomWeight = Math.floor(Math.random() * 100) + 1; // Weight from 1 to 100

    questions.push({
      content: `Question content for question ${i + 1}`,
      difficulty: randomDifficulty,
      weight: randomWeight,
    });
  }

  return questions;
};

const seedQuestions = async () => {
  try {
    await Question.deleteMany(); // Clear existing questions
    const questions = generateRandomQuestions(500);
    await Question.insertMany(questions);
    console.log("500 questions seeded successfully!");
  } catch (error) {
    console.error("Error seeding questions:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedQuestions();
