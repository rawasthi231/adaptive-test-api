import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import config from "../config";

import { errorResponse } from "../helpers";
import { IUser, User } from "../models/User";
import { IServiceResponse } from "../typings";

export default class AuthService {
  async signup(user: Partial<IUser>): Promise<IServiceResponse<IUser | null>> {
    try {
      const { email, name, password, role } = user;
      const existingUser = await User.findOne({
        email,
      });
      if (existingUser) {
        return {
          status: 409,
          message: "User already exists",
          data: null,
        };
      }

      const newUser = new User({
        email,
        name,
        password,
        role,
      });

      await newUser.save();

      return {
        status: 201,
        message: "User created successfully",
        data: newUser,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  /**
   * Logs in a user and returns a token
   * @param param - email and password
   * @returns {IServiceResponse<IUser | null>} - User data with token
   */
  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<IServiceResponse<IUser | null>> {
    try {
      const user = await User.findOne({
        email,
      });

      if (!user) {
        return {
          status: 404,
          message: "Email or password is incorrect",
          data: null,
        };
      }

      const checkPassword = await bcrypt.compare(password, user.password!);
      if (!checkPassword) {
        return {
          status: 401,
          message: "Email or password is incorrect",
          data: null,
        };
      }

      const token = jwt.sign(
        {
          id: user.id,
        },
        config.jwtSecret!,
        {
          expiresIn: 24 * 60 * 60 * 7, // 1 week
        }
      );

      delete user.password;

      return {
        message: "Logged in successfully",
        status: 200,
        data: { ...user, token },
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  async logout(userId?: string) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        return {
          status: 404,
          message: "User not found",
          data: null,
        };
      }

      await User.findByIdAndUpdate(userId, {
        token: undefined,
      });

      return {
        status: 200,
        message: "Logged out successfully",
        data: null,
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }
}
