import express from "express"

import verifyToken from "../middleware/verifyToken.js"
import { getAllTools, createTool } from "../controllers/toolController.js"

const router = express.Router()

router.get("/", verifyToken, getAllTools)
router.post("/", verifyToken, createTool)
// router.delete("/api/tool", verifyToken, deleteTool)

export default router
