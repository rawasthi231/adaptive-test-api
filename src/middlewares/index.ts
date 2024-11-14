import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import { IUser } from "../models/User";
import { IResponse } from "../typings";

export const authenticate = (
  req: Request & { user: Partial<IUser> },
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      user: IUser;
    };
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export const isAdmin = (
  req: Request & { user: Partial<IUser> },
  res: Response,
  next: NextFunction
) => {
  if (req.user.role !== 1) {
    return res.status(403).json({ msg: "Forbidden" });
  }
  next();
};

export const responseHandler = (_: Request, res: IResponse) => {
  const code = res.data?.status ?? 200;
  delete res.data?.status;
  return res.status(code).send(res.data);
};
