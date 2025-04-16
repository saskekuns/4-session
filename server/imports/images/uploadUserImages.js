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

const imagesDir = path.join(__dirname, "../../data/images/users")

const uploadImages = async () => {
  const files = fs.readdirSync(imagesDir)

  for (const file of files) {
    const ext = path.extname(file)
    const login = path.basename(file, ext)
    const filePath = path.join(imagesDir, file)

    // Пропускаем не-изображения
    if (
      ![".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext.toLowerCase())
    ) {
      console.warn(`Пропущен файл (не изображение): ${file}`)
      continue
    }

    try {
      const buffer = fs.readFileSync(filePath)

      const result = await pool.query(
        "UPDATE appuser SET photo = $1 WHERE login = $2",
        [buffer, login]
      )

      if (result.rowCount === 1) {
        console.log(`Загружено изображение для ${login}`)
      } else {
        console.warn(`Пропущено: нет пользователя с логином ${login}`)
      }
    } catch (err) {
      console.error(`Ошибка при обработке файла ${file}:`, err.message)
    }
  }

  await pool.end()
}

uploadImages()
