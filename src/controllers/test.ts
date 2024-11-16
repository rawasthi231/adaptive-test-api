import { Request, NextFunction } from "express";

import TestService from "../services/test";

import { IPagenationQuery, IRequest, IResponse } from "../typings";

export default class TestController {
  static async getAll(req: Request, res: IResponse, next: NextFunction) {
    const service = new TestService();
    res.data = await service.getAll(req.query as unknown as IPagenationQuery);
    next();
  }
  static async create(req: Request, res: IResponse, next: NextFunction) {
    const service = new TestService();
    res.data = await service.create(req.body);
    next();
  }
  static async start(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new TestService();
    res.data = await service.start(req.params.testId, req.user?.id);
    next();
  }

  static async getById(req: Request, res: IResponse, next: NextFunction) {
    const service = new TestService();
    res.data = await service.getById(req.params.testId);
    next();
  }
  static async getByUrl(req: Request, res: IResponse, next: NextFunction) {
    const service = new TestService();
    res.data = await service.getByUrl(req.params.uniqueURL);
    next();
  }
  static async submitAnswer(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new TestService();
    res.data = await service.submitAnswer({
      userId: req.user?.id,
      testId: req.params.testId,
      questionId: req.params.questionId,
      ...req.body,
    });
    next();
  }
}
