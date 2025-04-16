import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import pool from "../db.js" // ← вот эта строка нужна

const router = express.Router()

// Защищённый маршрут: информация о текущем пользователе
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Профиль пользователя",
    login: req.user.login,
    role: req.user.role,
  })
})

router.get("/client-managers", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT login, full_name FROM appuser WHERE role = 'Менеджер по продажам'`
    )
    res.json(result.rows)
  } catch (err) {
    console.error("Ошибка при получении менеджеров:", err)
    res.status(500).json({ error: "Ошибка при получении менеджеров" })
  }
})

router.get("/customers", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT login, full_name FROM appuser WHERE role = 'Заказчик'`
    )
    res.json(result.rows)
  } catch (err) {
    console.error("Ошибка при получении заказчиков:", err)
    res.status(500).json({ error: "Ошибка при получении заказчиков" })
  }
})

export default router
