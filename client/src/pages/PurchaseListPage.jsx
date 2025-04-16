import React, { useEffect, useState } from "react"
import axios from "axios"

export default function PurchaseListPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(
          "http://localhost:3000/api/orders/purchase-list",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        setItems(response.data)
      } catch (err) {
        setError(`Ошибка при загрузке данных: ${err.messge}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <p>Загрузка...</p>
  if (error) return <p>{error}</p>

  return (
    <div>
      <h2>Список закупок</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Тип</th>
            <th>Артикул</th>
            <th>Название</th>
            <th>Нужно</th>
            <th>На складе</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isNotEnough = item.available < item.required
            return (
              <tr
                key={`${item.type}-${item.article}`}
                style={{ backgroundColor: isNotEnough ? "#5c0d0d" : "#2a5d2f" }}
              >
                <td>
                  {item.type === "ingredient" ? "Ингредиент" : "Украшение"}
                </td>
                <td>{item.article}</td>
                <td>{item.name}</td>
                <td>{item.required}</td>
                <td>{item.available}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
