import { nanoid } from "nanoid";

import { errorResponse } from "../helpers";
import { ITest, Test } from "../models/Test";
import { UserTest } from "../models/UserTest";
import { IServiceResponse } from "../typings";
import { IQuestion, Question } from "../models/Question";
import { UserTestSubmission } from "../models/UserTestSubmission";

export default class TestService {
  /**
   * Create a new test in the database and return the created test
   * @param data - Test data including questions and description
   * @returns {Promise<IServiceResponse<ITest | null>>} - Test data
   */
  async create(data: Partial<ITest>) {
    try {
      const { questions, description } = data;
      const newTest = new Test({
        questions,
        description,
        url: nanoid(10),
      });

      await newTest.save();

      return {
        status: 201,
        message: "Test created successfully",
        data: newTest,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  /**
   * Start a test for a user by fetching the first question
   * @param testId - Test ID
   * @param userId - User ID
   * @returns {Promise<IServiceResponse<Array<{ question: IQuestion }>>} - First question of the test
   */
  async start(
    testId: string,
    userId?: string
  ): Promise<IServiceResponse<Array<{ question: IQuestion }> | null>> {
    try {
      const test = await Test.findOne({
        _id: testId,
      });
      if (!test) {
        return {
          status: 404,
          message: "Test not found",
          data: null,
        };
      }

      const userTest = new UserTest({
        test_id: test.id,
        user_id: userId,
      });

      await userTest.save();

      const firstQuestion = await Test.aggregate<{ question: IQuestion }>([
        {
          $match: { _id: test.id },
          $lookup: {
            from: "questions",
            let: { questionIds: "$questions" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$_id", "$$questionIds"] },
                      { $eq: ["$difficulty", 5] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: "questions",
          },
        },
        {
          $unwind: "$questions",
        },
        {
          $project: {
            question: "$questions",
          },
        },
      ]);

      return {
        status: 200,
        message: "Test started successfully",
        data: firstQuestion,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  /**
   * Submit answer to a question
   * @param {object} param - Answer data including user ID, test ID, question ID, answer, and current difficulty
   * @returns {Promise<IServiceResponse<{ shouldEndTest: boolean; nextQuestion: IQuestion} | null>>} - Next question or end of test status
   */
  async submitAnswer({
    userId,
    testId,
    questionId,
    answer,
  }: {
    userId?: string;
    testId: string;
    questionId: string;
    answer: string;
  }): Promise<
    IServiceResponse<{
      shouldEndTest: boolean;
      nextQuestion: IQuestion | null;
    } | null>
  > {
    try {
      const questionInfo = await Question.findOne({
        _id: questionId,
      });

      if (!questionInfo)
        return {
          status: 404,
          message: "Question not found",
          data: null,
        };

      const userTest = await UserTest.findOne({
        test_id: testId,
        user_id: userId,
      });

      if (!userTest)
        return {
          status: 404,
          message: "Test not found for user",
          data: null,
        };

      const userTestSubmission = new UserTestSubmission({
        user_test_id: userTest.id,
        question_id: questionId,
        answer,
      });

      // Save user test submission
      await userTestSubmission.save();

      let shouldEndTest = false;
      let shouldIncreaseDifficulty = false;

      let score = userTest.score;
      let currentDifficulty = questionInfo.difficulty;
      let consecutiveCorrect = userTest.consecutiveCorrect;

      // Check if answer is correct and increase score if correct answer
      if (questionInfo.answer === answer) {
        shouldIncreaseDifficulty = true; // Increase difficulty if answer is correct
        score += 1;

        if (questionInfo.difficulty === 10) {
          consecutiveCorrect += 1; // Increase consecutive correct answers if answer is correct and difficulty is 10
        }
      }

      // Check if test should end based on conditions
      const totalAttempts = await UserTestSubmission.countDocuments({
        $and: [{ user_test_id: userTest.id }],
      });

      /**
       * Test should end if:
       * - Total attempts are greater than or equal to 20
       * - Answer is incorrect and difficulty is 1
       * - 3 consecutive correct answers are given by user of difficulty 10 (maximum difficulty)
       */
      if (
        totalAttempts >= 20 ||
        (questionInfo.answer !== answer && questionInfo.difficulty === 1) ||
        consecutiveCorrect >= 3
      ) {
        shouldEndTest = true;
      }

      // Update user test with new score, completed status, current difficulty, and consecutive correct answers
      await UserTest.updateOne(
        {
          _id: userTest.id,
        },
        {
          score,
          completed: shouldEndTest,
          currentDifficulty,
          consecutiveCorrect,
        }
      );

      // Fetch next question based on current difficulty
      let nextQuestion: IQuestion | null = null;
      // If test should not end, fetch next question based on current difficulty
      if (!shouldEndTest) {
        nextQuestion = await Question.findOne({
          difficulty: currentDifficulty + (shouldIncreaseDifficulty ? 1 : -1),
        });
      }

      return {
        status: 200,
        message: "Answer submitted successfully",
        data: {
          shouldEndTest,
          nextQuestion,
        },
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  /**
   * Get test by URL
   * @param {string} url - Test URL
   * @returns {Promise<IServiceResponse<ITest | null>>} - Test data
   */
  async getByUrl(url: string) {
    try {
      const test = await Test.findOne({
        url,
      });

      if (!test)
        return {
          status: 404,
          message: "Test not found",
          data: null,
        };

      return {
        status: 200,
        message: "Test fetched successfully",
        data: test,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  /**
   * Get test by ID
   * @param {string} testId - Test ID
   * @returns {Promise<IServiceResponse<ITest | null>>} - Test data
   */
  async getById(testId: string) {
    try {
      const test = await Test.findOne({
        _id: testId,
      });

      if (!test)
        return {
          status: 404,
          message: "Test not found",
          data: null,
        };

      return {
        status: 200,
        message: "Test fetched successfully",
        data: test,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }
}
