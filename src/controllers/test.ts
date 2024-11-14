import { Request, Response, NextFunction } from "express";

import UserService from "../services/auth";

export default class TestController {
  static async start(req: Request, res: Response, next: NextFunction) {
    const service = new UserService();
    const data = await service.signup(req.body);
    res.send(data);
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    // Do something
  }
  static async getByUrl(req: Request, res: Response, next: NextFunction) {
    // Do something
  }
  static async submitAnswer(req: Request, res: Response, next: NextFunction) {
    // Do something
  }
}
