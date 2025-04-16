// pages/FailurePage.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function FailurePage() {
  const [equipment, setEquipment] = useState([])
  const [reasons, setReasons] = useState([])
  const [failures, setFailures] = useState([])
  const [form, setForm] = useState({
    equipment_id: "",
    reason_id: "",
    start_time: new Date().toISOString().slice(0, 16),
  })
  const [editingId, setEditingId] = useState(null)
  const [endTime, setEndTime] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user || user.role !== "Мастер") {
      navigate("/")
    } else {
      fetchInitialData()
      fetchFailures()
    }
  }, [])

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token")

      const [eqRes, reasonsRes] = await Promise.all([
        fetch("http://localhost:3000/api/equipment", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3000/api/failure/reasons", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const equipmentData = await eqRes.json()
      const reasonsData = await reasonsRes.json()

      setEquipment(equipmentData)
      setReasons(reasonsData)
    } catch (err) {
      console.error("Ошибка при загрузке справочников:", err)
    }
  }

  const fetchFailures = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3000/api/failure", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setFailures(data)
    } catch (err) {
      console.error("Ошибка при загрузке сбоев:", err)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")

    try {
      const res = await fetch("http://localhost:3000/api/failure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error("Ошибка при создании сбоя")
      alert("Сбой зарегистрирован")
      setForm({
        equipment_id: "",
        reason_id: "",
        start_time: new Date().toISOString().slice(0, 16),
      })
      fetchFailures()
    } catch (err) {
      alert("Ошибка при сохранении сбоя")
      console.error(err)
    }
  }

  const handleComplete = async (id) => {
    const token = localStorage.getItem("token")

    try {
      const res = await fetch(`http://localhost:3000/api/failure/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ end_time: endTime }),
      })

      if (!res.ok) throw new Error("Ошибка при завершении сбоя")
      alert("Сбой завершён")
      setEditingId(null)
      setEndTime("")
      fetchFailures()
    } catch (err) {
      alert("Ошибка при сохранении окончания")
      console.error(err)
    }
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Сбои оборудования</h2>
      <p>Страница доступна только мастерам.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <label>
          Оборудование:
          <select
            name="equipment_id"
            value={form.equipment_id}
            onChange={handleChange}
            required
          >
            <option value="">Выберите...</option>
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.label}
              </option>
            ))}
          </select>
        </label>
        <br />

        <label>
          Причина:
          <select
            name="reason_id"
            value={form.reason_id}
            onChange={handleChange}
            required
          >
            <option value="">Выберите...</option>
            {reasons.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <br />

        <label>
          Время начала:
          <input
            type="datetime-local"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <button type="submit">Зарегистрировать сбой</button>
      </form>

      <h3 style={{ marginTop: "2rem" }}>Зарегистрированные сбои</h3>
      <table border="1" cellPadding="8" style={{ marginTop: "0.5rem" }}>
        <thead>
          <tr>
            <th>Оборудование</th>
            <th>Причина</th>
            <th>Начало</th>
            <th>Окончание</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {failures.map((f) => (
            <tr key={f.id}>
              <td>{f.equipment_label}</td>
              <td>{f.reason_label}</td>
              <td>{new Date(f.start_time).toLocaleString()}</td>
              <td>
                {f.end_time ? new Date(f.end_time).toLocaleString() : "—"}
              </td>
              <td>
                {!f.end_time &&
                  (editingId === f.id ? (
                    <>
                      <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                      <button onClick={() => handleComplete(f.id)}>
                        Сохранить
                      </button>
                      <button onClick={() => setEditingId(null)}>Отмена</button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(f.id)
                        setEndTime(new Date().toISOString().slice(0, 16))
                      }}
                    >
                      Завершить
                    </button>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
