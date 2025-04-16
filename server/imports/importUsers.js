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

const filePath = path.join(__dirname, "../data/users.xlsx")
const workbook = xlsx.readFile(filePath)
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rawData = xlsx.utils.sheet_to_json(sheet)

const importUsers = async () => {
  for (const row of rawData) {
    try {
      const {
        Login: login,
        Password: password,
        Role: role,
        Фамилия: lastName,
        Имя_отчество: namePart,
      } = row

      if (!login || !password || !role) continue

      const full_name = `${lastName} ${namePart}`.trim()

      await pool.query(
        `INSERT INTO appuser (
          login, password, role, full_name
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (login) DO NOTHING`,
        [login, password, role, full_name]
      )

      console.log(`Импортирован: ${login}`)
    } catch (err) {
      console.error(`Ошибка для ${row.Login}: ${err.message}`)
    }
  }

  await pool.end()
}

importUsers()
