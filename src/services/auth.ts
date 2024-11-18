import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { errorResponse } from "../helpers";
import { IUser, User } from "../models/User";
import { IServiceResponse } from "../typings";

export default class AuthService {
  /**
   * Signs up a user and returns a token for the user
   * @param {Partial<IUser>} user - User data
   * @returns {IServiceResponse<IUser & { token: string } | null>} - User data with token
   */
  async signup(
    user: Partial<IUser>
  ): Promise<IServiceResponse<(IUser & { token: string }) | null>> {
    try {
      const { email, name, password, role } = user;
      const existingUser = await User.findOne({
        email,
      });
      if (existingUser) {
        return {
          status: 409,
          message: "User already exists",
        };
      }

      const hashedPassword = await bcrypt.hash(password!.trim(), 8);

      const newUser = new User({
        email,
        name,
        password: hashedPassword,
        role,
      });

      await newUser.save();

      const newUserObject = newUser.toJSON();
      delete newUserObject.password;

      const token = jwt.sign(
        {
          user: {
            id: user.id,
            role: user.role,
          },
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "7d", // 7 days
        }
      );

      return {
        status: 201,
        message: "User created successfully",
        data: { ...newUserObject, token },
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }

  /**
   * Logs in a user and returns a token
   * @param param - email and password
   * @returns {IServiceResponse<IUser  & { token: string } | null>} - User data with token
   */
  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<IServiceResponse<(IUser & { token: string }) | null>> {
    try {
      const user = await User.findOne(
        {
          email,
        },
        {
          id: 1,
          email: 1,
          name: 1,
          role: 1,
          password: 1,
        }
      );

      if (!user) {
        return {
          status: 401,
          message: "Email or password is incorrect",
        };
      }

      const checkPassword = await bcrypt.compare(password, user.password!);

      if (!checkPassword) {
        return {
          status: 401,
          message: "Email or password is incorrect",
        };
      }

      const token = jwt.sign(
        {
          user: {
            id: user.id,
            role: user.role,
          },
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "7d", // 7 days
        }
      );

      const userObject = user.toJSON();
      delete userObject.password;

      return {
        message: "Logged in successfully",
        status: 200,
        data: { ...userObject, token },
      };
    } catch (error) {
      console.log(error);
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
        };
      }

      await User.findByIdAndUpdate(userId, {
        token: undefined,
      });

      return {
        status: 200,
        message: "Logged out successfully",
      };
    } catch (error) {
      return errorResponse(JSON.stringify(error));
    }
  }
}
