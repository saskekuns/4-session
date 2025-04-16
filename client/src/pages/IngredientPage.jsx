import { useEffect, useState } from "react"
import axios from "axios"

export default function IngredientPage() {
  const [ingredients, setIngredients] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState("")
  const [editingIngredient, setEditingIngredient] = useState(null)

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

    fetchIngredients()
  }, [])

  function fetchIngredients() {
    setLoading(true)
    const token = localStorage.getItem("token")
    const url = new URL("http://localhost:3000/api/ingredients")

    if (filterDate) {
      url.searchParams.append("expireBefore", filterDate)
    }

    axios
      .get(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setIngredients(res.data)
        setLoading(false)
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message || "Ошибка при загрузке ингредиентов"
        setError(msg)
        setLoading(false)
      })
  }

  function handleDelete(article) {
    const confirmed = window.confirm(
      "Вы уверены, что хотите удалить этот ингредиент?"
    )
    if (!confirmed) return

    const token = localStorage.getItem("token")

    axios
      .delete(`http://localhost:3000/api/ingredients/${article}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setIngredients((prev) =>
          prev.filter((item) => item.article !== article)
        )
      })
      .catch((err) => {
        alert("Ошибка при удалении")
        console.error(err)
      })
  }

  if (loading) return <p>Загрузка...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>

  function handleEditSubmit(e) {
    e.preventDefault()
    const token = localStorage.getItem("token")

    axios
      .put(
        `http://localhost:3000/api/ingredients/${editingIngredient.article}`,
        editingIngredient,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        // обновляем список
        fetchIngredients()
        setEditingIngredient(null)
      })
      .catch((err) => {
        alert("Ошибка при сохранении изменений")
        console.error(err)
      })
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Ингредиенты</h2>

      <div style={{ marginBottom: "1rem" }}>
        {/* Редактирование */}
        {canEdit && editingIngredient && (
          <div
            style={{
              marginTop: "2rem",
              borderTop: "1px solid gray",
              paddingTop: "1rem",
            }}
          >
            <h3>Редактирование ингредиента: {editingIngredient.name}</h3>
            <form onSubmit={handleEditSubmit}>
              <label>
                Наименование:
                <input
                  type="text"
                  value={editingIngredient.name}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
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
                  value={editingIngredient.quantity}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
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
                  value={editingIngredient.unit}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      unit: e.target.value,
                    })
                  }
                />
              </label>
              <br />
              <label>
                Цена:
                <input
                  type="number"
                  value={editingIngredient.price}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      price: e.target.value,
                    })
                  }
                />
              </label>
              <br />
              <label>
                Поставщик:
                <input
                  type="text"
                  value={editingIngredient.supplier_name}
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      supplier_name: e.target.value,
                    })
                  }
                />
              </label>
              <br />
              <label>
                Срок годности:
                <input
                  type="date"
                  value={
                    editingIngredient.expiration_date
                      ? new Date(editingIngredient.expiration_date)
                          .toISOString()
                          .substr(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setEditingIngredient({
                      ...editingIngredient,
                      expiration_date: e.target.value,
                    })
                  }
                />
              </label>
              <br />
              <button type="submit">Сохранить изменения</button>
              <button type="button" onClick={() => setEditingIngredient(null)}>
                Отмена
              </button>
            </form>
          </div>
        )}

        <label>
          Фильтр по сроку годности (до):
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ marginLeft: "1rem", marginRight: "1rem" }}
          />
        </label>
        <button onClick={fetchIngredients}>Применить фильтр</button>
      </div>

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Артикул</th>
            <th>Наименование</th>
            <th>Кол-во</th>
            <th>Ед. изм.</th>
            <th>Цена закупки</th>
            <th>Поставщик</th>
            <th>Срок доставки (дней)</th>
            <th>Срок годности</th>
            {canEdit && <th>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {ingredients.map((item) => (
            <tr key={item.article}>
              <td>{item.article}</td>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.price}₽</td>
              <td>{item.supplier_name || "—"}</td>
              <td>{item.delivery_time ?? "—"}</td>
              <td>
                {item.expiration_date
                  ? new Date(item.expiration_date).toLocaleDateString("ru-RU")
                  : "—"}
              </td>
              {canEdit && (
                <td>
                  <button
                    style={{ marginBottom: "1rem" }}
                    onClick={() => setEditingIngredient(item)}
                  >
                    Редактировать
                  </button>
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
      <p>Количество позиций: {ingredients.length}</p>
      <p>
        Общая сумма закупки:{" "}
        {ingredients
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
