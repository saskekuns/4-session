import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import {
  getAllDecorations,
  deleteDecoration,
  updateDecoration,
} from "../controllers/decorationController.js"

const router = express.Router()

router.get("/", verifyToken, getAllDecorations)
router.delete("/:article", verifyToken, deleteDecoration)
router.put("/:article", verifyToken, updateDecoration)

export default router
