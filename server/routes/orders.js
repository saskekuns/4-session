// routes/orders.js
import express from "express"
import verifyToken from "../middleware/verifyToken.js"

import {
  createOrder,
  getOrders,
  updateStatus,
  getHistory,
  deleteOrder,
  editOrder,
  getPurchaseList,
} from "../controllers/orderController.js"

const router = express.Router()

// Заказы
router.post("/", verifyToken, createOrder)
router.get("/", verifyToken, getOrders)
router.patch("/:id/status", verifyToken, updateStatus)
router.get("/:id/history", getHistory)
router.delete("/:id", verifyToken, deleteOrder)
router.patch("/:id", verifyToken, editOrder)
router.get("/purchase-list", verifyToken, getPurchaseList)

export default router
