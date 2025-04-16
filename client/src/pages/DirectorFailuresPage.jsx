import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function DirectorFailuresPage() {
  const [failures, setFailures] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [report, setReport] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user || user.role !== "Директор") {
      navigate("/")
      return
    }

    fetchFailures()
  }, [])

  const fetchFailures = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3000/api/failure", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Ошибка при получении данных")

      const data = await res.json()
      setFailures(data)
    } catch (err) {
      console.error("Ошибка при загрузке сбоев:", err)
      setError("Не удалось загрузить данные.")
    } finally {
      setLoading(false)
    }
  }

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("token")
      const url = `http://localhost:3000/api/failure/report?start=${startDate}&end=${endDate}`

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Ошибка отчёта")

      const data = await res.json()
      setReport(data)
      setError("")
    } catch (err) {
      console.error("Ошибка при получении отчёта:", err)
      setError("Ошибка при загрузке отчёта")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Сбои оборудования (режим директора)</h2>

      {loading ? (
        <p>Загрузка...</p>
      ) : error && failures.length === 0 ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%", marginBottom: "2rem" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Оборудование</th>
                <th>Причина</th>
                <th>Начало</th>
                <th>Окончание</th>
                <th>Зарегистрировал</th>
              </tr>
            </thead>
            <tbody>
              {failures.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.equipment_label}</td>
                  <td>{f.reason_label}</td>
                  <td>{new Date(f.start_time).toLocaleString()}</td>
                  <td>{f.end_time ? new Date(f.end_time).toLocaleString() : "—"}</td>
                  <td>{f.registered_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h3>📊 Отчёт по сбоям (группировка по причинам)</h3>
      <p>По каждой причине отображено суммарное время простоя оборудования за выбранный период.</p>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Начало:{" "}
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label style={{ marginLeft: "1rem" }}>
          Конец:{" "}
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button style={{ marginLeft: "1rem" }} onClick={fetchReport}>
          Получить отчёт
        </button>
        <button style={{ marginLeft: "1rem" }} onClick={handlePrint}>
          🖨️ Печать
        </button>
      </div>

      {error && report.length === 0 && <p style={{ color: "red" }}>{error}</p>}

      {report.length > 0 ? (
        <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Причина сбоя</th>
              <th>Суммарное время простоев (минуты)</th>
            </tr>
          </thead>
          <tbody>
            {report.map((row, index) => (
              <tr key={index}>
                <td>{row.reason}</td>
                <td>{Math.round(row.total_minutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ fontStyle: "italic" }}>
          Нет данных для отчёта. Выберите период и нажмите «Получить отчёт».
        </p>
      )}
    </div>
  )
}
