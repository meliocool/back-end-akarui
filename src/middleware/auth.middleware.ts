import { NextFunction, Request, Response } from "express"
import { getUserData, IUserToken } from "../utils/jwt"

export interface IReqUser extends Request {
  user?: IUserToken
}

export default (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization
  if (!authorization) {
    return res.status(403).json({
      message: "Unauthorized!",
      data: null,
    })
  }
  const [prefix, accessToken] = authorization.split(" ") // Dipisah berdasarkan spasi, jadi [0] = Bearer [1] = Tokennya
  if (!(prefix === "Bearer" && accessToken)) {
    return res.status(403).json({
      message: "Unauthorized!",
      data: null,
    })
  }
  const user = getUserData(accessToken)

  if (user === null) {
    return res.status(403).json({
      message: "User Not Found!",
      data: null,
    })
  }

  ;(req as IReqUser).user = user
  next() // Go next
}
