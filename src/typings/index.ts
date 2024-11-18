import { Request, Response } from "express";
import { IUser } from "../models/User";
import { ITest } from "../models/Test";
import { IQuestion } from "../models/Question";
import { IUserTest } from "../models/UserTest";
import { IUserTestSubmission } from "../models/UserTestSubmission";

export interface IServiceResponse<T = undefined> {
  message: string;
  data?: T;
  status?: number;
  error?: string;
  nextCursor?: number;
}

export interface IRequest extends Request {
  user?: IUser;
}

export interface IResponse extends Response {
  token?: string;
  data?: IServiceResponse<unknown>;
}

export interface IPagenationQuery {
  skip: number;
  take?: number;
}

export interface IStartTestResponse extends ITest {
  question: IQuestion;
}

export interface IUserTests extends IUserTest {
  test: ITest;
  questions: IQuestion[];
  submittedAnswers: IUserTestSubmission[];
  correctCount: number;
  wrongCount: number;
}
