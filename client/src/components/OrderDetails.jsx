import React, { useState, useEffect } from "react"

// Components
import AddQualityForm from "./AddQualityForm"

export default function OrderDetails({ details }) {
  const [qualityChecks, setQualityChecks] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ result: true, comment: "" })

  useEffect(() => {
    const token = localStorage.getItem("token")
    const fetchChecks = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/quality/${details.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (!res.ok) throw new Error("Ошибка при загрузке")
        const data = await res.json()
        setQualityChecks(data)
      } catch (err) {
        console.error("Ошибка загрузки параметров контроля:", err)
      }
    }

    if (details?.id) {
      fetchChecks()
    }
  }, [details])

  if (!details) return null

  const handleEdit = (q) => {
    setEditingId(q.id)
    setEditForm({ result: q.result, comment: q.comment || "" })
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleEditSave = async () => {
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(
        `http://localhost:3000/api/quality/${editingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      )
      if (!res.ok) throw new Error("Ошибка при обновлении")
      setEditingId(null)
      setEditForm({ result: true, comment: "" })
      // перезагрузить данные
      const refetch = await fetch(
        `http://localhost:3000/api/quality/${details.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const data = await refetch.json()
      setQualityChecks(data)
    } catch (err) {
      console.error("Ошибка при сохранении редактирования:", err)
    }
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Детали заказа #{details.id}</h3>
      <table style={styles.table}>
        <tbody>
          <tr>
            <th style={{ ...styles.cell, ...styles.cellLabel }}>Описание</th>
            <td style={styles.cell}>{details.description || "—"}</td>
          </tr>
          <tr>
            <th style={{ ...styles.cell, ...styles.cellLabel }}>Размеры</th>
            <td style={styles.cell}>
              {Array.isArray(details.dimensions) &&
              details.dimensions.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                  {details.dimensions.map((dim, idx) => (
                    <li key={idx}>
                      {dim.unit}: {dim.value}
                    </li>
                  ))}
                </ul>
              ) : (
                "—"
              )}
            </td>
          </tr>
          <tr>
            <th style={{ ...styles.cell, ...styles.cellLabel }}>Изображения</th>
            <td style={styles.cell}>
              <div style={styles.imageGrid}>
                {Array.isArray(details.images) && details.images.length > 0
                  ? details.images.map((src, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:3000/${src}`}
                        alt={`img-${idx}`}
                        style={styles.image}
                      />
                    ))
                  : "—"}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {(details.status === "контроль" || details.status === "готово") && (
        <div style={{ marginTop: "2rem" }}>
          <h4>Контроль качества</h4>
          <AddQualityForm
            orderId={details.id}
            onAdd={(newCheck) =>
              setQualityChecks((prev) => [...prev, newCheck])
            }
          />

          {qualityChecks.length > 0 && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.cell}>Параметр</th>
                  <th style={styles.cell}>Оценка</th>
                  <th style={styles.cell}>Комментарий</th>
                  <th style={styles.cell}>Проверил</th>
                  <th style={styles.cell}></th>
                </tr>
              </thead>
              <tbody>
                {qualityChecks.map((q) => (
                  <tr key={q.id}>
                    <td style={styles.cell}>{q.parameter}</td>
                    <td
                      style={{
                        ...styles.cell,
                        color: q.result ? "green" : "red",
                      }}
                    >
                      {editingId === q.id ? (
                        <input
                          type="checkbox"
                          name="result"
                          checked={editForm.result}
                          onChange={handleEditChange}
                        />
                      ) : q.result ? (
                        "✔"
                      ) : (
                        "✘"
                      )}
                    </td>
                    <td style={styles.cell}>
                      {editingId === q.id ? (
                        <input
                          type="text"
                          name="comment"
                          value={editForm.comment}
                          onChange={handleEditChange}
                        />
                      ) : (
                        q.comment || "—"
                      )}
                    </td>
                    <td style={styles.cell}>{q.checked_by}</td>
                    <td style={styles.cell}>
                      {editingId === q.id ? (
                        <>
                          <button onClick={handleEditSave}>Сохранить</button>{" "}
                          <button onClick={() => setEditingId(null)}>
                            Отмена
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleEdit(q)}>
                          Редактировать
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    borderRadius: "8px",
    padding: "1rem",
    maxWidth: "900px",
    margin: "2rem auto",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  table: {
    width: "100%",
    border: "1px solid #ccc",
  },
  cell: {
    border: "1px solid #ccc",
    padding: "0.75rem",
    verticalAlign: "top",
  },
  cellLabel: {
    textAlign: "left",
    padding: "0.75rem",
    fontWeight: "bold",
    width: "200px",
    verticalAlign: "top",
  },
  imageGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    marginTop: "0.5rem",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    textAlign: "center",
  },
}
