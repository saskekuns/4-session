// routes/equipment.js
import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import pool from "../db.js"

const router = express.Router()

router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, label FROM equipment")
    res.json(result.rows)
  } catch (err) {
    console.error("Ошибка при получении оборудования:", err)
    res.status(500).json({ error: "Ошибка сервера" })
  }
})

export default router
