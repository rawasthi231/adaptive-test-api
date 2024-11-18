import { errorResponse } from "../helpers";
import { ITest, Test } from "../models/Test";
import { IUserTest, UserTest } from "../models/UserTest";
import {
  IPagenationQuery,
  IServiceResponse,
  IStartTestResponse,
  IUserTests,
} from "../typings";
import { IQuestion, Question } from "../models/Question";
import {
  IUserTestSubmission,
  UserTestSubmission,
} from "../models/UserTestSubmission";

export default class TestService {
  /**
   * Get all questions from the database
   * @returns - Promise<IQuestion[] | null>
   */
  async getAll({
    skip,
    take = 10,
  }: IPagenationQuery): Promise<IServiceResponse<ITest[] | null>> {
    try {
      const total = await Test.countDocuments();
      const hasMore = total > +skip + take;
      const tests = await Test.find().skip(skip).limit(take);
      if (!tests) {
        return {
          status: 404,
          message: "No tests found",
        };
      }

      return {
        status: 200,
        message: "Tests fetched successfully",
        data: tests,
        nextCursor: hasMore ? +skip + take : undefined,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  /**
   * Create a new test in the database and return the created test
   * @param data - Test data including questions and description
   * @returns {Promise<IServiceResponse<ITest | null>>} - Test data
   */
  async create(data: Partial<ITest>): Promise<IServiceResponse<ITest | null>> {
    try {
      const { questions, description, title } = data;

      const newTest = new Test({
        title,
        questions: (questions as string[]).map((question) =>
          question.toObjectId()
        ),
        description,
        url: Buffer.from(title!).toString("base64"),
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
   * Find the next question based on the test ID and difficulty level of the question
   * @param {string} testId - Test ID
   * @param {number} difficulty - Difficulty level of the question
   * @returns {Promise<T[]>} - Next question based on the test ID and difficulty level
   */
  async findNextQuestion<T>(testId: string, difficulty = 5): Promise<T[]> {
    return await Test.aggregate<T>([
      {
        $match: { _id: testId.toObjectId() },
      },
      {
        $lookup: {
          from: "questions",
          let: { questionIds: "$questions" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$questionIds"] },
                    { $eq: ["$difficulty", difficulty] },
                  ],
                },
              },
            },
            { $limit: 1 },
            {
              $project: {
                _id: 0,
                id: "$_id",
                question: "$question",
                difficulty: "$difficulty",
                options: "$options",
              },
            },
          ],
          as: "questions",
        },
      },
      {
        $unwind: { path: "$questions", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          title: 1,
          description: 1,
          url: 1,
          question: "$questions",
        },
      },
    ]);
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
  ): Promise<IServiceResponse<IStartTestResponse | null>> {
    try {
      const test = await Test.findOne({
        _id: testId.toObjectId(),
      });
      if (!test) {
        return {
          status: 404,
          message: "Test not found",
        };
      }

      const userTest = new UserTest({
        test_id: testId.toObjectId(),
        user_id: userId?.toObjectId(),
      });

      await userTest.save();

      const question = await this.findNextQuestion<IStartTestResponse>(testId);

      return {
        status: 200,
        message: "Test started successfully",
        data: question.length ? question[0] : undefined,
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
        _id: questionId.toObjectId(),
      });

      if (!questionInfo)
        return {
          status: 404,
          message: "Question not found",
        };

      const userTest = await UserTest.findOne({
        test_id: testId.toObjectId(),
        user_id: userId?.toObjectId(),
      });

      if (!userTest)
        return {
          status: 404,
          message: "Test not found for user",
        };

      const userTestSubmission = new UserTestSubmission({
        user_test_id: userTest.id,
        question_id: questionId.toObjectId(),
        answer,
      });

      // Save user test submission
      await userTestSubmission.save();

      let shouldEndTest = false;
      let shouldIncreaseDifficulty = false;

      let score = userTest.score || 0;
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
        user_test_id: userTest.id,
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

      // Fetch next question based on current difficulty
      let nextQuestion: IQuestion | null = null;
      // If test should not end, fetch next question based on current difficulty
      if (!shouldEndTest) {
        [nextQuestion] = await Question.aggregate<IQuestion>([
          {
            $lookup: {
              from: "tests",
              let: { testId: testId.toObjectId() },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$testId"],
                    },
                  },
                },
              ],
              as: "testDetails",
            },
          },
          {
            $unwind: { path: "$testDetails", preserveNullAndEmptyArrays: true },
          },
          {
            $lookup: {
              from: "usertestsubmissions",
              let: { userTestId: userTest.id.toObjectId() },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$user_test_id", "$$userTestId"],
                    },
                  },
                },
              ],
              as: "submissions",
            },
          },
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$_id", "$testDetails.questions"] },
                  {
                    $not: {
                      $in: [
                        "$_id",
                        { $ifNull: ["$submissions.question_id", []] },
                      ],
                    },
                  },
                  {
                    $gte: [
                      "$difficulty",
                      currentDifficulty + (shouldIncreaseDifficulty ? 1 : -1),
                    ],
                  },
                ],
              },
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              _id: 0,
              id: "$_id",
              question: "$question",
              difficulty: "$difficulty",
              options: "$options",
            },
          },
        ]);
      }

      shouldEndTest = nextQuestion ? false : true;

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
      const test = await Test.findOne(
        {
          url,
        },
        {
          id: 1,
          description: 1,
          title: 1,
          url: 1,
        }
      );

      if (!test)
        return {
          status: 404,
          message: "Test not found",
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
        _id: testId.toObjectId(),
      });

      if (!test)
        return {
          status: 404,
          message: "Test not found",
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
   * Get user tests by user ID and return the tests with questions and submitted answers
   * @param {string} userId - User ID
   * @returns {Promise<IServiceResponse<IUserTests[] | null>>} - User tests
   */
  async getUserTests(
    userId?: string
  ): Promise<IServiceResponse<IUserTests[] | null>> {
    try {
      let tests = await UserTest.aggregate<IUserTests>([
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ["$completed", true],
                },
                {
                  $eq: ["$user_id", userId!.toObjectId()],
                },
              ],
            },
          },
        },
        {
          $lookup: {
            from: "tests",
            let: { testId: "$test_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$testId"] },
                },
              },
            ],
            as: "test",
          },
        },
        {
          $unwind: { path: "$test", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "questions",
            let: { questionIds: "$test.questions" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", { $ifNull: ["$$questionIds", []] }],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  id: "$_id",
                  question: "$question",
                  difficulty: "$difficulty",
                  answer: "$answer",
                },
              },
            ],
            as: "questions",
          },
        },
        {
          $lookup: {
            from: "usertestsubmissions",
            let: { userTestId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$user_test_id", "$$userTestId"],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  question_id: 1,
                  answer: 1,
                },
              },
            ],
            as: "submittedAnswers",
          },
        },
        {
          $project: {
            _id: 0,
            id: "$_id",
            test_id: "$test_id",
            score: 1,
            completed: 1,
            updatedAt: 1,
            test: {
              title: "$test.title",
              description: "$test.description",
              url: "$test.url",
            },
            questions: 1,
            submittedAnswers: 1,
          },
        },
      ]);

      let correctCount = 0;
      let wrongCount = 0;

      tests.forEach((test) => {
        correctCount = 0;
        wrongCount = 0;
        test.submittedAnswers.forEach((submission: IUserTestSubmission) => {
          const question = test.questions.find(
            (q) => q.id.toString() === submission.question_id.toString()
          );

          // Compare the answers
          if (question && question.answer === submission.answer) {
            correctCount++;
          } else {
            wrongCount++;
          }
        });
        test.correctCount = correctCount;
        test.wrongCount = wrongCount;
      });

      return {
        status: 200,
        message: "Tests fetched successfully",
        data: tests,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  /**
   * Delete a test from the database
   * @param {string} testId - Test ID
   * @returns {Promise<IServiceResponse<boolean | null>>} - Test deleted status
   */
  async destroy(testId: string) {
    try {
      console.log(testId);

      const test = await Test.findOneAndDelete({
        _id: testId.toObjectId(),
      });

      if (!test)
        return {
          status: 404,
          message: "Test not found",
        };

      return {
        status: 200,
        message: "Test deleted successfully",
        data: true,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }
}
