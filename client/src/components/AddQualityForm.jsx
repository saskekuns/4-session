import { useState } from "react"

export default function AddQualityForm({ orderId, onAdd }) {
  const [parameter, setParameter] = useState("")
  const [result, setResult] = useState(true)
  const [comment, setComment] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")

    try {
      const res = await fetch(`http://localhost:3000/api/quality`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          parameter,
          result,
          comment,
        }),
      })

      if (!res.ok) throw new Error("Ошибка при добавлении")

      const data = await res.json()
      onAdd(data) // добавим в состояние qualityChecks
      setParameter("")
      setResult(true)
      setComment("")
    } catch (err) {
      alert("Ошибка: " + err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      <table>
        <thead>
          <tr>
            <th>Параметр</th>
            <th>Оценка</th>
            <th>Комментарий</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
                type="text"
                value={parameter}
                onChange={(e) => setParameter(e.target.value)}
                required
              />
            </td>
            <td>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value === "true")}
              >
                <option value="true">✔</option>
                <option value="false">✘</option>
              </select>
            </td>
            <td>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </td>
            <td>
              <button type="submit">Добавить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  )
}
