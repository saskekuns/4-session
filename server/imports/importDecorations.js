import fs from "fs"
import path from "path"
import xlsx from "xlsx"
import dotenv from "dotenv"
import pg from "pg"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()

const { Pool } = pg
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

const filePath = path.join(__dirname, "../data/decorations.xlsx")
const workbook = xlsx.readFile(filePath)
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rawData = xlsx.utils.sheet_to_json(sheet)

const importDecorations = async () => {
  for (const row of rawData) {
    try {
      const {
        Артикул: article,
        Наименование: name,
        Единицы_измерения: unit,
        Количество: quantity,
        Тип: type,
        Цена: price,
        Вес: weight,
      } = row

      if (!article) continue

      await pool.query(
        `INSERT INTO decoration (
          article, name, unit, quantity, type, price, weight
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          article,
          name,
          unit || "шт.",
          parseFloat(quantity) || 0,
          type || "Неизвестно",
          parseFloat(price) || 0,
          weight !== undefined ? parseFloat(weight) : null,
        ]
      )

      console.log(`Импортирован: ${article}`)
    } catch (err) {
      console.error(`Ошибка для ${row.Артикул}: ${err.message}`)
    }
  }

  await pool.end()
}

importDecorations()
