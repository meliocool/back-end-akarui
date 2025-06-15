import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel, {
  userDTO,
  userLoginDTO,
  userUpdatePasswordDTO,
} from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

export default {
  async updateProfile(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      const { fullName, profilePicture } = req.body;
      const result = await UserModel.findByIdAndUpdate(
        userId,
        {
          fullName,
          profilePicture,
        },
        {
          new: true,
        }
      );
      if (!result) return response.notFound(res, "User Not Found");
      response.success(res, result, "Profile Updated Successfully!");
    } catch (error) {
      response.error(res, error, "Failed to Update Profile");
    }
  },
  async updatePassword(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      const { oldPassword, password, confirmPassword } = req.body;
      await userUpdatePasswordDTO.validate({
        oldPassword,
        password,
        confirmPassword,
      });
      const user = await UserModel.findById(userId);
      if (!user || user.password !== encrypt(oldPassword))
        return response.notFound(res, "User Not Found!");

      const result = await UserModel.findByIdAndUpdate(
        userId,
        {
          password: encrypt(password),
        },
        {
          new: true,
        }
      );
      response.success(res, result, "Password Updated Successfully!");
    } catch (error) {
      response.error(res, error, "Failed to Update Password");
    }
  },
  async register(req: Request, res: Response) {
    // Get property body from req
    const { fullName, username, email, password, confirmPassword } = req.body;
    try {
      await userDTO.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
      });
      response.success(res, result, "Registration Success!");
    } catch (error) {
      response.error(res, error, "Registration Failed!");
    }
  },
  async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;
      await userLoginDTO.validate({
        identifier,
        password,
      });
      // ambil data user berdasarkan identifier -> email OR username
      // use $or to check only one
      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
        isActive: true, // Only active users can login
      });
      if (!userByIdentifier) {
        return response.unauthorized(res, "User Not Found!");
      }
      // validasi password if password given === password in db
      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatePassword) {
        return response.unauthorized(res, "User Not Found!");
      }

      // Generate Token, disimpan di Header
      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });
      response.success(res, token, `Login Success! for user: ${identifier}!`);
    } catch (error) {
      response.error(res, error, "Login Failed!");
    }
  },
  async me(req: IReqUser, res: Response) {
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);
      response.success(res, result, "Success! Authorized to get User Profile");
    } catch (error) {
      response.error(res, error, "Failed to get User Profile!");
    }
  },
  async activation(req: Request, res: Response) {
    try {
      const { code } = req.body as { code: string };
      const user = await UserModel.findOneAndUpdate(
        {
          activationCode: code,
        },
        {
          isActive: true,
        },
        {
          new: true,
        }
      );
      response.success(res, user, "User Successfully Activated!");
    } catch (error) {
      response.error(res, error, "Activation failed!");
    }
  },
};
