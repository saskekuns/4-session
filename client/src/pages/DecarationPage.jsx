import { useEffect, useState } from "react"
import axios from "axios"

export default function DecorationPage() {
  const [decorations, setDecorations] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [editingDecoration, setEditingDecoration] = useState(null)

  const role = localStorage.getItem("role")
  const canEdit = role === "Директор" || role === "Менеджер по закупкам"
  const canView =
    role === "Директор" ||
    role === "Менеджер по закупкам" ||
    role === "Мастер" ||
    role === "Менеджер по продажам"

  useEffect(() => {
    if (!canView) {
      setError("Доступ запрещён: ваша роль не имеет доступа к этой странице")
      setLoading(false)
      return
    }

    fetchDecorations()
  }, [])

  function fetchDecorations() {
    setLoading(true)
    const token = localStorage.getItem("token")

    axios
      .get("http://localhost:3000/api/decorations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDecorations(res.data)
        setLoading(false)
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message || "Ошибка при загрузке украшений"
        setError(msg)
        setLoading(false)
      })
  }

  function handleDelete(article) {
    const confirmed = window.confirm("Удалить украшение?")
    if (!confirmed) return

    const token = localStorage.getItem("token")

    axios
      .delete(`http://localhost:3000/api/decorations/${article}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setDecorations((prev) =>
          prev.filter((item) => item.article !== article)
        )
      })
      .catch((err) => {
        alert("Ошибка при удалении")
        console.error(err)
      })
  }

  function handleEditSubmit(e) {
    e.preventDefault()
    const token = localStorage.getItem("token")

    axios
      .put(
        `http://localhost:3000/api/decorations/${editingDecoration.article}`,
        editingDecoration,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        fetchDecorations()
        setEditingDecoration(null)
      })
      .catch((err) => {
        alert("Ошибка при сохранении")
        console.error(err)
      })
  }

  if (loading) return <p>Загрузка...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Украшения</h2>
      {canEdit && editingDecoration && (
        <div
          style={{
            marginTop: "2rem",
            borderTop: "1px solid gray",
            paddingTop: "1rem",
          }}
        >
          <h3>Редактирование украшения: {editingDecoration.name}</h3>
          <form onSubmit={handleEditSubmit}>
            <label>
              Наименование:
              <input
                type="text"
                value={editingDecoration.name}
                onChange={(e) =>
                  setEditingDecoration({
                    ...editingDecoration,
                    name: e.target.value,
                  })
                }
              />
            </label>
            <br />
            <label>
              Кол-во:
              <input
                type="number"
                value={editingDecoration.quantity}
                onChange={(e) =>
                  setEditingDecoration({
                    ...editingDecoration,
                    quantity: e.target.value,
                  })
                }
              />
            </label>
            <br />
            <label>
              Ед. изм.:
              <input
                type="text"
                value={editingDecoration.unit}
                onChange={(e) =>
                  setEditingDecoration({
                    ...editingDecoration,
                    unit: e.target.value,
                  })
                }
              />
            </label>
            <br />
            <label>
              Вес:
              <input
                type="number"
                value={editingDecoration.weight}
                onChange={(e) =>
                  setEditingDecoration({
                    ...editingDecoration,
                    weight: e.target.value,
                  })
                }
              />
            </label>
            <br />
            <label>
              Цена:
              <input
                type="number"
                value={editingDecoration.price}
                onChange={(e) =>
                  setEditingDecoration({
                    ...editingDecoration,
                    price: e.target.value,
                  })
                }
              />
            </label>
            <br />
            <label>
              Тип:
              <input
                type="text"
                value={editingDecoration.type}
                onChange={(e) =>
                  setEditingDecoration({
                    ...editingDecoration,
                    type: e.target.value,
                  })
                }
              />
            </label>
            <br />
            <label>
              Поставщик:
              <input
                type="text"
                value={editingDecoration.supplier_name}
                onChange={(e) =>
                  setEditingDecoration({
                    ...editingDecoration,
                    supplier_name: e.target.value,
                  })
                }
              />
            </label>
            <br />
            <button type="submit">Сохранить</button>
            <button type="button" onClick={() => setEditingDecoration(null)}>
              Отмена
            </button>
          </form>
        </div>
      )}

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Артикул</th>
            <th>Наименование</th>
            <th>Кол-во</th>
            <th>Ед. изм.</th>
            <th>Вес</th>
            <th>Цена</th>
            <th>Тип</th>
            <th>Поставщик</th>
            {canEdit && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {decorations.map((item) => (
            <tr key={item.article}>
              <td>{item.article}</td>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.weight ?? "—"}</td>
              <td>{item.price}₽</td>
              <td>{item.type || "—"}</td>
              <td>{item.supplier_name || "—"}</td>
              {canEdit && (
                <td>
                  <button
                    style={{ marginBottom: "0.5rem" }}
                    onClick={() => setEditingDecoration(item)}
                  >
                    Редактировать
                  </button>
                  <br />
                  <button onClick={() => handleDelete(item.article)}>
                    Удалить
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <br />
      <h3>Сводка</h3>
      <p>Количество позиций: {decorations.length}</p>
      <p>
        Общая сумма:{" "}
        {decorations
          .reduce(
            (total, item) =>
              total +
              parseFloat(item.price || 0) * parseFloat(item.quantity || 0),
            0
          )
          .toFixed(2)}
        ₽
      </p>
    </div>
  )
}
