import { Request, Response } from "express"
import * as Yup from "yup"
import UserModel from "../models/user.model"
import { encrypt } from "../utils/encryption"
import { generateToken } from "../utils/jwt"
import { IReqUser } from "../middleware/auth.middleware"

type TRegister = {
  fullName: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

type TLogin = {
  identifier: string
  password: string
}

const registerValidateSchema = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().required(),
  password: Yup.string().required(),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Password not Matched!"),
})

export default {
  async register(req: Request, res: Response) {
    // Get property body from req
    const { fullName, username, email, password, confirmPassword } =
      req.body as unknown as TRegister
    try {
      await registerValidateSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      })

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
      })

      res.status(200).json({
        message: `Registration Success!`,
        data: result,
      })
    } catch (error) {
      const err = error as unknown as Error
      res.status(400).json({
        message: `Registration Failed! ${err.message}`,
        data: null,
      })
    }
  },
  async login(req: Request, res: Response) {
    /**
     #swagger.requestBody = {
      required: true,
      schema: {$ref: "#/components/schemas/LoginRequest"}
     }
     */
    const { identifier, password } = req.body as unknown as TLogin
    try {
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
      })
      if (!userByIdentifier) {
        return res.status(403).json({
          message: "User Not Found!",
          data: null,
        })
      }
      // validasi password if password given === password in db
      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password

      if (!validatePassword) {
        return res.status(403).json({
          message: `Wrong Password for user ${identifier}!`,
          data: null,
        })
      }

      // Generate Token, disimpan di Header
      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      })

      res.status(200).json({
        message: `Login Success! for user: ${identifier}!`,
        data: token,
      })
    } catch (error) {
      const err = error as unknown as Error
      res.status(400).json({
        message: `Login Failed! ${err.message}`,
        data: null,
      })
    }
  },

  async me(req: IReqUser, res: Response) {
    /**
     #swagger.security = [{
      "bearerAuth": []
     }]
     */
    try {
      const user = req.user
      const result = await UserModel.findById(user?.id)
      res.status(200).json({
        message: "Success! Authorized to get User Profile",
        data: result,
      })
    } catch (error) {
      const err = error as unknown as Error
      res.status(400).json({
        message: `Login Failed! ${err.message}`,
        data: null,
      })
    }
  },
}
