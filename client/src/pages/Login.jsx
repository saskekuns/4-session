import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function Login() {
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (loginAttempts >= 3) {
      setIsLocked(true)
      setError("Слишком много попыток. Подождите 5 секунд...")

      const timer = setTimeout(() => {
        setLoginAttempts(0)
        setIsLocked(false)
        setError("")
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [loginAttempts])

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    if (isLocked) return

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          login,
          password,
        }
      )

      const { token, role } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("role", role)
      localStorage.setItem("user", JSON.stringify({ login, role }))

      switch (role) {
        case "Заказчик":
          navigate("/customer")
          break
        case "Менеджер по продажам":
          navigate("/client-manager")
          break
        case "Менеджер по закупкам":
          navigate("/supply-manager")
          break
        case "Мастер":
          navigate("/master")
          break
        case "Директор":
          navigate("/director")
          break
        default:
          navigate("/")
      }
    } catch (err) {
      setLoginAttempts((prev) => prev + 1)
      setError("Неверный логин или пароль")
      console.log(err)
    }
  }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "auto",
        padding: "2rem",
      }}
    >
      <h2>Авторизация</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          disabled={isLocked}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLocked}
          required
        />
        <br />
        <button type="submit" disabled={isLocked}>
          Войти
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      <br />
      <button onClick={() => navigate("/register")}>Регистрация</button>
    </div>
  )
}
