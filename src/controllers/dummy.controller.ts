import { Request, Response } from "express"

export default {
  dummy(req: Request, res: Response) {
    res.status(200).json({
      message: "Success hitting the endpoint /dummy hello!",
      data: "OK",
    })
  },
}
