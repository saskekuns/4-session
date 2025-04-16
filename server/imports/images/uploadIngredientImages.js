import fs from "fs"
import path from "path"
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

const imagesDir = path.join(__dirname, "../../data/images/ingredients")

const uploadImages = async () => {
  const files = fs.readdirSync(imagesDir)

  for (const file of files) {
    const ext = path.extname(file)
    const name = path.basename(file, ext) // article = имя файла без расширения
    const filePath = path.join(imagesDir, file)

    try {
      const buffer = fs.readFileSync(filePath)

      const result = await pool.query(
        "UPDATE ingredient SET image = $1 WHERE article = $2",
        [buffer, name]
      )

      if (result.rowCount === 1) {
        console.log(`Загружено изображение для ${name}`)
      } else {
        console.warn(`Пропущено: нет записи с артикулом ${name}`)
      }
    } catch (err) {
      console.error(`Ошибка при обработке файла ${file}:`, err.message)
    }
  }

  await pool.end()
}

uploadImages()
