import { NextFunction } from "express";

import QuestionService from "../services/question";

import { IPagenationQuery, IRequest, IResponse } from "../typings";

export default class QuestionController {
  static async create(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new QuestionService();
    res.data = await service.create(req.body);
    next();
  }

  static async getAll(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new QuestionService();
    res.data = await service.getAll(req.query as unknown as IPagenationQuery);
    next();
  }

  static async getOne(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new QuestionService();
    res.data = await service.getOne(req.params.id);
    next();
  }

  static async update(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new QuestionService();
    res.data = await service.update(req.params.id, req.body);
    next();
  }
  static async destroy(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new QuestionService();
    res.data = await service.destroy(req.params.id);
    next();
  }
}
