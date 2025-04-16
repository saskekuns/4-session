import express from "express"
import pool from "../db.js"

const router = express.Router()

// Сохранение схемы цеха
router.post("/:id/layout", async (req, res) => {
  const workshop = req.params.id
  const { icons, rotation } = req.body

  try {
    console.log("BODY:", req.body)
    const result = await pool.query(
      `
      INSERT INTO workshop_layouts (workshop, icons, rotation)
      VALUES ($1, $2::jsonb, $3)
      ON CONFLICT (workshop)
      DO UPDATE SET icons = EXCLUDED.icons, rotation = EXCLUDED.rotation
      `,
      [workshop, JSON.stringify(icons), rotation]
    )
    res.status(200).json({ message: "Layout saved" })
  } catch (err) {
    console.error("Ошибка при сохранении схемы:", err)
    res.status(500).json({ error: "Ошибка при сохранении схемы" })
  }
})

// Загрузка схемы цеха
router.get("/:id/layout", async (req, res) => {
  const workshop = req.params.id
  try {
    const result = await pool.query(
      "SELECT icons, rotation FROM workshop_layouts WHERE workshop = $1",
      [workshop]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Нет данных" })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error("Ошибка при загрузке схемы:", err)
    res.status(500).json({ error: "Ошибка при загрузке схемы" })
  }
})

export default router
