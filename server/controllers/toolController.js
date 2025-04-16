import pool from "../db.js"

// Получение всех инструментов
export async function getAllTools(req, res) {
  try {
    if (req.user.role !== "Директор") {
      return res.status(403).json({ message: "Доступ запрещён" })
    }

    const result = await pool.query("SELECT * FROM tool")
    const tools = result.rows.map((tool) => {
      const purchaseDate = new Date(tool.purchase_date)
      const now = new Date()
      const months =
        (now.getFullYear() - purchaseDate.getFullYear()) * 12 +
        now.getMonth() -
        purchaseDate.getMonth()

      return {
        ...tool,
        age_in_months: months,
      }
    })

    res.json(tools)
  } catch (err) {
    console.error("Ошибка при получении инструментов:", err)
    res.status(500).json({ message: "Ошибка сервера" })
  }
}

// Добавление нового инструмента
export async function createTool(req, res) {
  try {
    if (req.user.role !== "Директор") {
      return res.status(403).json({ message: "Доступ запрещён" })
    }

    const {
      name,
      description,
      type,
      wear_degree,
      supplier_name,
      purchase_date,
      quantity,
    } = req.body

    await pool.query(
      `INSERT INTO tool 
        (name, description, type, wear_degree, supplier_name, purchase_date, quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        name,
        description,
        type,
        wear_degree,
        supplier_name,
        purchase_date,
        parseInt(quantity),
      ]
    )

    res.status(201).json({ message: "Инструмент успешно добавлен" })
  } catch (err) {
    console.error("Ошибка при добавлении инструмента:", err)
    res.status(500).json({ message: "Ошибка сервера" })
  }
}
