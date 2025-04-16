import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Register() {
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  function validatePassword(password, login) {
    const hasUpperCase = /[A-ZА-Я]/.test(password)
    const hasLowerCase = /[a-zа-я]/.test(password)
    const isLongEnough = password.length >= 5 && password.length <= 20
    const doesNotContainLogin = !password
      .toLowerCase()
      .includes(login.toLowerCase())

    return isLongEnough && hasUpperCase && hasLowerCase && doesNotContainLogin
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    if (!validatePassword(password, login)) {
      setError(
        "Пароль должен содержать от 5 до 20 символов, включать заглавные и строчные буквы и не содержать логин"
      )
      return
    }

    try {
      await axios.post("http://localhost:3000/api/auth/register", {
        login,
        password,
        full_name: fullName,
        role: "Заказчик",
      })

      alert("Регистрация прошла успешно!")
      navigate("/") // переход на форму входа
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка регистрации")
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
      <h2>Регистрация заказчика</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
        <br />
        <input
          type="text"
          placeholder="Имя и отчество"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Зарегистрироваться</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  )
}
