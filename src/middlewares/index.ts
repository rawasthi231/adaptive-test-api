import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import { IUser } from "../models/User";
import { IRequest, IResponse } from "../typings";
import { COOKIE_EXPIRY } from "../constants";

/**
 * @description - Middleware to authenticate user token
 * @param {IRequest} req - Request object
 * @param {IResponse} res - Response object
 * @param {NextFunction} next - Next function
 * @returns {void} - Returns void
 */
export const authenticate = (
  req: IRequest,
  res: IResponse,
  next: NextFunction
) => {
  const cookie = req.headers.cookie;

  if (!cookie) {
    return res.status(401).send("Unauthorized");
  }

  const token = cookie.replace("x-api-key=", "");

  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      user: IUser;
    };

    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized");
  }
};

/**
 * @description - Middleware to authenticate admin user
 * @param {IRequest} req - Request object
 * @param {IResponse} res - Response object
 * @param {NextFunction} next - Next function
 * @returns {void} - Returns void
 */
export const isAdmin = (req: IRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 1) {
    return res.status(403).send("Forbidden");
  }
  next();
};

/**
 * @description - Middleware to handle response
 * @param {Request} _ - Request object
 * @param {IResponse} res - Response object
 * @returns {Response} - Returns response
 */
export const responseHandler = (_: Request, res: IResponse) => {
  const code = res.data?.status ?? 200;
  delete res.data?.status;
  return res.status(code).send(res.data);
};

export const setCookies = (_: Request, res: IResponse, next: NextFunction) => {
  if (res.token) {
    res.cookie("x-api-key", res.token, {
      httpOnly: true,
      sameSite: "none",
      maxAge: COOKIE_EXPIRY,
      secure: true,
    });
  }
  next();
};
