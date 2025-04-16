import React from "react"

export default function OrdersTable({
  orders,
  statusFilter,
  dateFilter,
  setStatusFilter,
  setDateFilter,
  renderActions,
}) {
  const filteredOrders = Array.isArray(orders)
    ? orders.filter((o) => {
        const matchStatus = statusFilter ? o.status === statusFilter : true
        const matchDate = dateFilter ? o.order_date === dateFilter : true
        return matchStatus && matchDate
      })
    : []

  return (
    <>
      <h3>Список заказов</h3>
      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Все статусы</option>
          <option value="новый">Новый</option>
          <option value="отменён">Отменён</option>
          <option value="составление спецификации">
            Составление спецификации
          </option>
          <option value="подтверждение">Подтверждение</option>
          <option value="закупка">Закупка</option>
          <option value="производство">Производство</option>
          <option value="контроль">Контроль</option>
          <option value="готово">Готово</option>
          <option value="выполнен">Выполнен</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>№</th>
            <th>Дата</th>
            <th>Изделие</th>
            <th>Кол-во</th>
            <th>Менеджер</th>
            <th>Заказчик</th>
            <th>Плановая дата</th>
            <th>Стоимость</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{new Date(o.order_date).toLocaleDateString("ru-RU")}</td>
              <td>{o.product_name}</td>
              <td>{o.quantity}</td>
              <td>{o.manager_login}</td>
              <td>{o.customer_login ?? "—"}</td>
              <td>
                {o.planned_date
                  ? new Date(o.planned_date).toLocaleDateString("ru-RU")
                  : "—"}
              </td>
              <td>{o.price ?? "—"}</td>
              <td>{o.status}</td>
              <td
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "5px",
                  flexWrap: "wrap",
                }}
              >
                {renderActions(o)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
