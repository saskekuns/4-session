import pool from "../db.js"

export async function getAllDecorations(req, res) {
  try {
    console.log("Пользователь:", req.user)
    const allowedRoles = [
      "Директор",
      "Менеджер по закупкам",
      "Менеджер по продажам",
      "Мастер",
    ]

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Доступ запрещён" })
    }

    const result = await pool.query(`
      SELECT
        article,
        name,
        quantity,
        unit,
        price,
        supplier_name,
        type,
        weight
      FROM decoration
    `)

    res.json(result.rows)
  } catch (err) {
    console.error("Ошибка при получении украшений:", err)
    res.status(500).json({ message: "Ошибка сервера" })
  }
}

export async function deleteDecoration(req, res) {
  try {
    const allowedRoles = ["Директор", "Менеджер по закупкам"]

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Доступ запрещён" })
    }

    const article = req.params.article

    const result = await pool.query(
      `DELETE FROM decoration WHERE article = $1`,
      [article]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Украшение не найдено" })
    }

    res.json({ message: "Украшение удалено" })
  } catch (err) {
    console.error("Ошибка при удалении украшения:", err)
    res.status(500).json({ message: "Ошибка сервера" })
  }
}

export async function updateDecoration(req, res) {
  try {
    const allowedRoles = ["Директор", "Менеджер по закупкам"]

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Доступ запрещён" })
    }

    const article = req.params.article
    const { name, quantity, unit, price, supplier_name, type, weight } =
      req.body

    const result = await pool.query(
      `UPDATE decoration
       SET name = $1,
           quantity = $2,
           unit = $3,
           price = $4,
           supplier_name = $5,
           type = $6,
           weight = $7
       WHERE article = $8`,
      [name, quantity, unit, price, supplier_name, type, weight, article]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Украшение не найдено" })
    }

    res.json({ message: "Украшение обновлено" })
  } catch (err) {
    console.error("Ошибка при обновлении украшения:", err)
    res.status(500).json({ message: "Ошибка сервера" })
  }
}
