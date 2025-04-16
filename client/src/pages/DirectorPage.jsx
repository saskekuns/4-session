import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function DirectorPage() {
  const [tools, setTools] = useState([])
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    wear_degree: "",
    supplier_name: "",
    purchase_date: "",
    quantity: "",
  })
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/")
      return
    }

    axios
      .get("http://localhost:3000/api/tools", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTools(res.data))
      .catch((err) => {
        console.error(err)
        navigate("/")
      })
  }, [navigate])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    const token = localStorage.getItem("token")

    try {
      await axios.post("http://localhost:3000/api/tools", form, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const res = await axios.get("http://localhost:3000/api/tools", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTools(res.data)

      setForm({
        name: "",
        description: "",
        type: "",
        wear_degree: "",
        supplier_name: "",
        purchase_date: "",
        quantity: "",
      })
    } catch (err) {
      setError("Ошибка при добавлении")
      console.log(err)
    }
  }

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Учёт инструментов (директор)</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Наименование" value={form.name} onChange={handleChange} required />
        <br />
        <input name="description" placeholder="Описание" value={form.description} onChange={handleChange} />
        <br />
        <input name="type" placeholder="Тип инструмента" value={form.type} onChange={handleChange} />
        <br />
        <input name="wear_degree" placeholder="Степень износа" value={form.wear_degree} onChange={handleChange} />
        <br />
        <input name="supplier_name" placeholder="Поставщик" value={form.supplier_name} onChange={handleChange} />
        <br />
        <input name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange} />
        <br />
        <input name="quantity" type="number" placeholder="Количество" value={form.quantity} onChange={handleChange} />
        <br />
        <button type="submit">Добавить</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      <h3>Список инструментов</h3>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Наименование</th>
            <th>Тип</th>
            <th>Возраст (мес)</th>
            <th>Количество</th>
          </tr>
        </thead>
        <tbody>
          {tools.map((tool) => (
            <tr key={tool.id}>
              <td>{tool.name}</td>
              <td>{tool.type}</td>
              <td>{tool.age_in_months}</td>
              <td>{tool.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />
      <div style={{ display: "flex", flexWrap: "wrap", columnGap: "10px", rowGap: "10px", marginBottom: "1rem" }}>
        <button onClick={() => navigate("/ingredients")}>Ингредиенты</button>
        <button onClick={() => navigate("/decorations")}>Декорации</button>
        <button onClick={() => navigate("/workshop-layout")}>Схемы цехов</button>
        <button onClick={() => navigate("/orders")}>Заказы</button>
        <button onClick={() => navigate("/director/failures")}>Сбои оборудования</button> {/* 🔥 новая кнопка */}
      </div>

      <button onClick={handleLogout}>Выйти</button>
    </div>
  )
}
