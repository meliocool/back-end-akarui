import express from "express"
import authController from "../controllers/auth.controller"
import authMiddleware from "../middleware/auth.middleware"

const router = express.Router()

router.post("/auth/register", authController.register)
router.post("/auth/login", authController.login)
router.get("/auth/me", authMiddleware, authController.me) // (path:string, middleWare:func, authController.me: func)
router.post("/auth/activation", authController.activation)

export default router
