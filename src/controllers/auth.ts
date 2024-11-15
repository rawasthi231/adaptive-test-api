import { NextFunction } from "express";

import AuthService from "../services/auth";

import { IRequest, IResponse } from "../typings";

export default class AuthController {
  static async signup(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new AuthService();
    res.data = await service.signup(req.body);
    next();
  }

  static async login(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new AuthService();
    res.data = await service.login(req.body);
    next();
  }

  static async logout(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new AuthService();
    res.data = await service.logout(req.user?.id);
    next();
  }
}
