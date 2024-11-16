import { Request, Response } from "express";
import { IUser } from "../models/User";

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
