import { NextFunction } from "express";

import AuthService from "../services/auth";

import { IRequest, IResponse } from "../typings";

export default class AuthController {
  static async signup(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new AuthService();
    const { data, ...rest } = await service.signup(req.body);
    if (data && data.token) {
      res.token = data.token;
      delete (data as { token?: string }).token;
    }
    res.data = { data, ...rest };
    next();
  }

  static async login(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new AuthService();
    const { data, ...rest } = await service.login(req.body);
    if (data && data.token) {
      res.token = data.token;
      delete (data as { token?: string }).token;
    }
    res.data = { data, ...rest };
    next();
  }

  static async logout(req: IRequest, res: IResponse, next: NextFunction) {
    const service = new AuthService();
    res.data = await service.logout(req.user?.id);
    res.clearCookie("x-auth-token");
    next();
  }
}
