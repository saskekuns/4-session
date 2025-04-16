// controllers/qualityController.js
import pool from "../db.js"

// Получить параметры качества по заказу
export async function getQualityChecks(req, res) {
  const { orderId } = req.params

  try {
    const result = await pool.query(
      `SELECT * FROM quality_checks WHERE order_id = $1 ORDER BY id`,
      [orderId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error("Ошибка при получении параметров качества:", err)
    res.status(500).json({ error: "Ошибка при получении данных" })
  }
}

// Добавить новый параметр
export async function addQualityCheck(req, res) {
  const { order_id, parameter, result, comment } = req.body
  const checked_by = req.user.login

  try {
    const response = await pool.query(
      `INSERT INTO quality_checks (order_id, parameter, result, comment, checked_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [order_id, parameter, result, comment, checked_by]
    )
    res.json(response.rows[0])
  } catch (err) {
    console.error("Ошибка при добавлении параметра качества:", err)
    res.status(500).json({ error: "Ошибка при сохранении" })
  }
}

// Обновить параметр (оценка и комментарий)
export async function updateQualityCheck(req, res) {
  const { id } = req.params
  const { result, comment } = req.body

  try {
    const response = await pool.query(
      `UPDATE quality_checks
       SET result = $1,
           comment = $2,
           updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [result, comment, id]
    )
    res.json(response.rows[0])
  } catch (err) {
    console.error("Ошибка при обновлении параметра качества:", err)
    res.status(500).json({ error: "Ошибка при обновлении" })
  }
}
