import pool from "../db.js"

// Получить все причины сбоев (для формы)
export async function getFailureReasons(req, res) {
  try {
    const result = await pool.query("SELECT * FROM failure_reasons ORDER BY id")
    res.json(result.rows)
  } catch (err) {
    console.error("Ошибка при получении причин сбоев:", err)
    res.status(500).json({ error: "Ошибка при получении причин" })
  }
}

// Получить все сбои
export async function getFailures(req, res) {
  try {
    const result = await pool.query(
      `SELECT ef.*, eq.label AS equipment_label, fr.label AS reason_label
       FROM equipment_failures ef
       JOIN equipment eq ON ef.equipment_id = eq.id
       JOIN failure_reasons fr ON ef.reason_id = fr.id
       ORDER BY ef.start_time DESC`
    )
    res.json(result.rows)
  } catch (err) {
    console.error("Ошибка при получении сбоев:", err)
    res.status(500).json({ error: "Ошибка при получении сбоев" })
  }
}

// Создать новый сбой
export async function createFailure(req, res) {
  const { equipment_id, reason_id, start_time } = req.body
  const registered_by = req.user.login

  try {
    const result = await pool.query(
      `INSERT INTO equipment_failures
        (equipment_id, reason_id, start_time, registered_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [equipment_id, reason_id, start_time, registered_by]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error("Ошибка при создании сбоя:", err)
    res.status(500).json({ error: "Ошибка при создании сбоя" })
  }
}

// Завершить сбой (установить время окончания)
export async function completeFailure(req, res) {
  const { id } = req.params
  const { end_time } = req.body

  try {
    await pool.query(
      `UPDATE equipment_failures SET end_time = $1 WHERE id = $2`,
      [end_time, id]
    )
    res.json({ message: "Сбой завершён" })
  } catch (err) {
    console.error("Ошибка при завершении сбоя:", err)
    res.status(500).json({ error: "Ошибка при завершении сбоя" })
  }
}

// 📊 Получить отчёт по сбоям за период с группировкой по причинам
export async function getFailureReport(req, res) {
  const { start, end } = req.query

  if (!start || !end) {
    return res.status(400).json({ error: "Укажите начальную и конечную дату" })
  }

  try {
    const result = await pool.query(
      `SELECT
         r.label AS reason,
         SUM(EXTRACT(EPOCH FROM (f.end_time - f.start_time)) / 60) AS total_minutes
       FROM equipment_failures f
       JOIN failure_reasons r ON f.reason_id = r.id
       WHERE f.start_time >= $1 AND f.end_time <= $2
       GROUP BY r.label
       ORDER BY total_minutes DESC`,
      [start, end]
    )

    res.json(result.rows)
  } catch (err) {
    console.error("Ошибка при получении отчета по сбоям:", err)
    res.status(500).json({ error: "Ошибка при получении отчета" })
  }
}
