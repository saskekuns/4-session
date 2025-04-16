import pool from "../db.js"

export async function getAllIngredients(req, res) {
  try {
    console.log("Пользователь:", req.user)
    const allowedRoles = [
      "Директор",
      "Менеджер по закупкам",
      "Менеджер по продажам",
      "Мастер",
    ]

    // Проверка на роль
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Доступ запрещён" })
    }

    // ← добавлено
    const { expireBefore } = req.query
    let query = `
      SELECT
        i.article,
        i.name,
        i.quantity,
        i.unit,
        i.price,
        i.supplier_name,
        s.delivery_time,
        i.expiration_date
      FROM ingredient i
      LEFT JOIN supplier s ON i.supplier_name = s.name
    `
    const params = []

    if (expireBefore) {
      query += ` WHERE i.expiration_date IS NOT NULL AND i.expiration_date >= $1`
      params.push(expireBefore)
    }

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    console.error("Ошибка при получении ингредиентов:", err)
    res.status(500).json({ message: "Ошибка сервера" })
  }
}

export async function deleteIngredient(req, res) {
  try {
    const allowedRoles = ["Директор", "Менеджер по закупкам"]

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Доступ запрещён" })
    }

    const article = req.params.article

    const result = await pool.query(
      "DELETE FROM ingredient WHERE article = $1",
      [article]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Ингредиент не найден" })
    }

    res.json({ message: "Ингредиент удалён" })
  } catch (err) {
    console.error("Ошибка при удалении ингредиента:", err)
    res.status(500).json({ message: "Ошибка сервера" })
  }
}

export async function updateIngredient(req, res) {
  try {
    const allowedRoles = ["Директор", "Менеджер по закупкам"]

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Доступ запрещён" })
    }

    const article = req.params.article
    const { name, quantity, unit, price, supplier_name, expiration_date } =
      req.body

    const result = await pool.query(
      `UPDATE ingredient
       SET name = $1,
           quantity = $2,
           unit = $3,
           price = $4,
           supplier_name = $5,
           expiration_date = $6
       WHERE article = $7`,
      [name, quantity, unit, price, supplier_name, expiration_date, article]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Ингредиент не найден" })
    }

    res.json({ message: "Ингредиент обновлён" })
  } catch (err) {
    console.error("Ошибка при обновлении ингредиента:", err)
    res.status(500).json({ message: "Ошибка сервера" })
  }
}
