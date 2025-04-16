import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import pool from "../db.js" // подключение к PostgreSQL

const registerUser = async (req, res) => {
  try {
    const { login, password, full_name, role } = req.body

    // Проверка, существует ли пользователь
    const userCheck = await pool.query(
      "SELECT * FROM appuser WHERE login = $1",
      [login]
    )
    if (userCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким логином уже существует" })
    }

    // Хешируем пароль
    // const hashedPassword = await bcrypt.hash(password, 10)

    // Вставляем пользователя
    await pool.query(
      "INSERT INTO appuser (login, password, role, full_name) VALUES ($1, $2, $3, $4)",
      [login, password, role || "user", full_name]
    )

    res.status(201).json({ message: "Пользователь успешно зарегистрирован" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Ошибка сервера" })
  }
}

const loginUser = async (req, res) => {
  try {
    const { login, password } = req.body

    const userResult = await pool.query(
      "SELECT * FROM appuser WHERE login = $1",
      [login]
    )
    const user = userResult.rows[0]

    if (!user) {
      return res.status(400).json({ message: "Неверный логин или пароль" })
    }

    // Хешируем пароль
    // const isMatch = await bcrypt.compare(password, user.password)
    // if (!isMatch) {
    //   return res.status(400).json({ message: "Неверный логин или пароль" })
    // }

    // Без хеширования
    if (password !== user.password) {
      return res.status(400).json({ message: "Неверный логин или пароль" })
    }

    const token = jwt.sign(
      { login: user.login, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    )

    res.json({
      token,
      login: user.login,
      role: user.role,
      full_name: user.full_name,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Ошибка сервера" })
  }
}

export { registerUser, loginUser }
