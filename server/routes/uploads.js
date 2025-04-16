import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"

const router = express.Router()

// Убедимся, что папка uploads существует
const uploadDir = "uploads"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

// Конфигурация multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, `${name}-${uniqueSuffix}${ext}`)
  },
})

const upload = multer({ storage })

// POST /api/uploads
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Файл не загружен" })
  }

  // Возвращаем путь к загруженному файлу
  res.json({ path: `${uploadDir}/${req.file.filename}` })
})

export default router
