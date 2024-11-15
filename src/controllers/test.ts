import { Request, NextFunction } from "express";

import TestService from "../services/test";

import { IRequest, IResponse } from "../typings";

export default class TestController {
  static async create(req: Request, res: IResponse, next: NextFunction) {
    const service = new TestService();
    res.data = await service.create(req.body);
  }
  static async start(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new TestService();
    res.data = await service.start(req.params.testId, req.user?.id);
  }

  static async getById(req: Request, res: IResponse, next: NextFunction) {
    const service = new TestService();
    res.data = await service.getById(req.params.testId);
  }
  static async getByUrl(req: Request, res: IResponse, next: NextFunction) {
    const service = new TestService();
    res.data = await service.getByUrl(req.params.testId);
  }
  static async submitAnswer(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new TestService();
    res.data = await service.submitAnswer({
      userId: req.user?.id,
      testId: req.params.testId,
      questionId: req.params.questionId,
      ...req.body,
    });
  }
}
