import { Request, Response } from "express";
import { IUser } from "../models/User";

export interface IServiceResponse<T = undefined> {
  message: string;
  data?: T;
  status?: number;
  error?: string;
}

export interface IRequest extends Request {
  user?: IUser;
}

export interface IResponse extends Response {
  data?: IServiceResponse<unknown>;
}
