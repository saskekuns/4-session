// routes/orders.js
import express from "express"

// Middleware
import verifyToken from "../middleware/verifyToken.js"

// Controlllers
import {
  getFailureReasons,
  getFailures,
  createFailure,
  completeFailure,
} from "../controllers/failureController.js"

const router = express.Router()

// Получить список всех сбоев
router.get("/", verifyToken, getFailures)

// Получить причины сбоев (для формы)
router.get("/reasons", verifyToken, getFailureReasons)

// Создать новый сбой
router.post("/", verifyToken, createFailure)

// Завершить сбой (внести время окончания)
router.patch("/:id", verifyToken, completeFailure)

export default router
