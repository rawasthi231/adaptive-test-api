import mongoose from "mongoose";

import { config } from "dotenv";

import { Question } from "../models/Question";

config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("Failed to connect to DB", err));

const generateRandomQuestions = (numQuestions: number) => {
  const questions = [];

  for (let i = 0; i < numQuestions; i++) {
    const randomDifficulty = Math.floor(Math.random() * 10) + 1; // Difficulty from 1 to 10
    const randomAnswer = Math.floor(Math.random() * 4) + 1; // Answer from 1 to 4

    questions.push({
      question: `Question ${i + 1}`,
      difficulty: +randomDifficulty,
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      answer: `Option ${randomAnswer}`,
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
