import { Request, Response, NextFunction } from "express";

import UserService from "../services/auth";
import { IResponse } from "../typings";

export default class TestController {
  static async signup(req: Request, res: IResponse, next: NextFunction) {
    const service = new UserService();
    res.data = await service.signup(req.body);
    next();
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    // Do something
  }
  static async logout(req: Request, res: Response, next: NextFunction) {
    // Do something
  }
}
