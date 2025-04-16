// routes/quality.js
import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import {
  getQualityChecks,
  addQualityCheck,
  updateQualityCheck,
} from "../controllers/qualityController.js"

const router = express.Router()

// Получить все параметры по заказу
router.get("/:orderId", verifyToken, getQualityChecks)

// Добавить параметр
router.post("/", verifyToken, addQualityCheck)

// Обновить параметр
router.patch("/:id", verifyToken, updateQualityCheck)

export default router
