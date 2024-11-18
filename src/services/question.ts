import { errorResponse } from "../helpers";
import { IQuestion, Question } from "../models/Question";
import { IPagenationQuery, IServiceResponse } from "../typings";

export default class QuestionService {
  /**
   * Create a new question in the database and return the created question
   * @param data - Partial<IQuestion>
   * @returns - Promise<IQuestion | null>
   */
  async create(
    data: Partial<IQuestion>
  ): Promise<IServiceResponse<IQuestion | null>> {
    try {
      const question = await Question.create({
        options: data.options,
        question: data.question,
        answer: data.answer,
        difficulty: data.difficulty,
      });
      return {
        message: "Question created successfully",
        data: question,
        status: 201,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  /**
   * Get all questions from the database
   * @returns - Promise<IQuestion[] | null>
   */
  async getAll({
    skip,
    take = 10,
  }: IPagenationQuery): Promise<IServiceResponse<IQuestion[] | null>> {
    try {
      const total = await Question.countDocuments();
      const hasMore = total > +skip + take;
      const questions = await Question.find()
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(take);
      if (!questions) {
        return {
          status: 404,
          message: "No questions found",
        };
      }

      return {
        status: 200,
        message: "Questions fetched successfully",
        data: questions,
        nextCursor: hasMore ? +skip + take : undefined,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  /**
   * Get one question from the database
   * @param id - string
   * @returns - Promise<IQuestion | null>
   */
  async getOne(id: string): Promise<IServiceResponse<IQuestion | null>> {
    try {
      const question = await Question.findOne({ _id: id });
      if (!question) {
        return {
          status: 404,
          message: "Question not found",
        };
      }

      return {
        message: "Question fetched successfully",
        data: question,
        status: 200,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  /**
   * Update a question in the database and return the updated question
   * @param id - string
   * @param data - Partial<IQuestion>
   * @returns - Promise<IQuestion | null>
   */
  async update(id: string, data: Partial<IQuestion>) {
    try {
      const result = await Question.findOne({ _id: id });
      if (!result) {
        return {
          status: 404,
          message: "Question not found",
        };
      }

      result.question = data.question || result.question;
      result.difficulty = data.difficulty || result.difficulty;
      result.options = data.options || result.options;
      result.answer = data.answer || result.answer;

      await result.save();

      return {
        status: 202,
        message: "Question updated successfully",
        data: result,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  /**
   * Delete a question from the database
   * @param id - string
   * @returns - Promise<IQuestion | null>
   */
  async destroy(id: string) {
    try {
      const question = await Question.findOne({ _id: id });
      if (!question) {
        return {
          status: 404,
          message: "Question not found",
        };
      }

      await question.deleteOne({ _id: id });

      return {
        status: 200,
        message: "Question deleted successfully",
        data: true,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }
}
