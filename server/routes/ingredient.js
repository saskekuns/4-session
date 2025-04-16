import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import {
  getAllIngredients,
  deleteIngredient,
  updateIngredient,
} from "../controllers/ingredientController.js"

const router = express.Router()

router.get("/", verifyToken, getAllIngredients)
router.delete("/:article", verifyToken, deleteIngredient)
router.put("/:article", verifyToken, updateIngredient)

export default router
