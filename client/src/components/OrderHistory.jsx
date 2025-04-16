import React from "react"

export default function OrderHistory({ selectedOrderId, history }) {
  if (!selectedOrderId) return null

  return (
    <div style={{ marginTop: "2rem" }}>
      <h4>История изменений для заказа #{selectedOrderId}</h4>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Было</th>
            <th>Стало</th>
            <th>Изменил</th>
            <th>Когда</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={i}>
              <td>{h.old_status}</td>
              <td>{h.new_status}</td>
              <td>{h.changed_by}</td>
              <td>{new Date(h.changed_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
