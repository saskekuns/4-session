import React from "react"

export default function OrderActions({
  order,
  user,
  fetchHistory,
  showDetails,
  handleStatusChange,
  handleDeleteOrder,
  startEditOrder,
}) {
  const isMyOrder = order.manager_login === user?.login
  const isSales = user?.role === "Менеджер по продажам"
  const isCustomer = user?.role === "Заказчик"
  const isOwnCustomerOrder = order.customer_login === user?.login

  const isCanDelete =
    order.status === "новый" &&
    ((isSales && isMyOrder) || (isCustomer && isOwnCustomerOrder))

  const buttons = []

  buttons.push(
    <button key="history" onClick={() => fetchHistory(order.id)}>
      История
    </button>,
    <button key="details" onClick={() => showDetails(order)}>
      Подробнее
    </button>
  )

  if (isCanDelete) {
    buttons.push(
      <button key="edit" onClick={() => startEditOrder(order)}>
        Редактировать
      </button>,
      <button key="delete" onClick={() => handleDeleteOrder(order.id)}>
        Удалить
      </button>
    )
  }

  if (isSales && isMyOrder) {
    if (order.status === "новый") {
      buttons.push(
        <button
          key="spec"
          onClick={() =>
            handleStatusChange(order.id, "составление спецификации")
          }
        >
          В работу
        </button>,
        <button
          key="cancel"
          onClick={() => handleStatusChange(order.id, "отменён")}
        >
          Отменить
        </button>
      )
    }

    if (order.status === "составление спецификации") {
      buttons.push(
        <button
          key="confirm"
          onClick={() => handleStatusChange(order.id, "подтверждение")}
        >
          Подтвердить
        </button>
      )
    }

    if (order.status === "подтверждение") {
      buttons.push(
        <button
          key="buy"
          onClick={() => handleStatusChange(order.id, "закупка")}
        >
          Закупка
        </button>,
        <button
          key="cancel2"
          onClick={() => handleStatusChange(order.id, "отменён")}
        >
          Отменить
        </button>
      )
    }

    if (order.status === "готово") {
      buttons.push(
        <button
          key="done"
          onClick={() => handleStatusChange(order.id, "выполнен")}
        >
          Выполнен
        </button>
      )
    }
  }

  if (user?.role === "Менеджер по закупкам" && order.status === "закупка") {
    buttons.push(
      <button
        key="toProduction"
        onClick={() => handleStatusChange(order.id, "производство")}
      >
        Производство
      </button>
    )
  }

  if (user?.role === "Мастер") {
    if (order.status === "производство") {
      buttons.push(
        <button
          key="toControl"
          onClick={() => handleStatusChange(order.id, "контроль")}
        >
          Контроль
        </button>
      )
    }

    if (order.status === "контроль") {
      buttons.push(
        <button
          key="toDone"
          onClick={() => handleStatusChange(order.id, "готово")}
        >
          Готово
        </button>
      )
    }
  }

  return <>{buttons}</>
}
