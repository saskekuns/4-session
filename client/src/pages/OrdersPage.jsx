import { useEffect, useState } from "react"

// Components
import OrderForm from "../components/OrderForm"
import OrdersTable from "../components/OrdersTable"
import OrderHistory from "../components/OrderHistory"
import OrderDetails from "../components/OrderDetails"
import OrderActions from "../components/OrderActions"

// Hooks
import { useOrders } from "../hooks/useOrders"
import { useManagers } from "../hooks/useManagers"
import { useCustomers } from "../hooks/useCustomers"
import { useAuthUser } from "../hooks/useAuthUser"
import { useOrderForm } from "../hooks/useOrderForm"

export default function OrdersPage() {
  const { orders, fetchOrders } = useOrders()
  const { managers, fetchManagers } = useManagers()
  const { customers, fetchCustomers } = useCustomers()
  const { user, userRole } = useAuthUser()

  const {
    form,
    description,
    dimensions,
    images,
    handleInputChange,
    handleDimensionChange,
    addDimension,
    uploadImage,
    handleSubmit,
    startEditOrder,
    setDescription,
  } = useOrderForm({
    userRole,
    onSuccess: fetchOrders,
  })

  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const [history, setHistory] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  const [details, setDetails] = useState(null)

  // Загрузка всех заказов
  useEffect(() => {
    fetchOrders()
    fetchManagers()
    fetchCustomers()
  }, [])

  const handleStatusChange = async (id, status) => {
    const raw = localStorage.getItem("user")
    const user = JSON.parse(raw)
    const token = localStorage.getItem("token")

    if (!user?.login || !token) {
      alert("Пользователь не авторизован")
      return
    }

    if (status === "готово") {
      const token = localStorage.getItem("token")
      const res = await fetch(`http://localhost:3000/api/quality/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        alert("Ошибка при проверке контроля качества")
        return
      }

      const checks = await res.json()

      if (checks.length === 0) {
        alert("Нельзя завершить контроль: параметры ещё не добавлены.")
        return
      }

      const hasNegative = checks.some((check) => check.result === false)
      if (hasNegative) {
        alert(
          "Нельзя завершить контроль: есть параметры с отрицательной оценкой."
        )
        return
      }
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/orders/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, changedBy: user.login }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        const message = result?.error || "Ошибка при обновлении статуса"
        alert(message)
        return
      }

      await fetchOrders()

      // Сброс отображаемого заказа и истории
      if (selectedOrderId === id) setSelectedOrderId(null)
      if (details?.id === id) setDetails(null)
    } catch (err) {
      alert("Ошибка при обновлении статуса")
      console.log(err.message)
    }
  }

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Удалить заказ?")) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`http://localhost:3000/api/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("Ошибка при удалении заказа")
      await fetchOrders()
    } catch (err) {
      alert("Ошибка при удалении заказа")
      console.error("Удаление заказа:", err)
    }
  }

  const fetchHistory = async (orderId) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(
        `http://localhost:3000/api/orders/${orderId}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await res.json()
      setHistory(data)
      setSelectedOrderId(orderId)
    } catch {
      alert("Ошибка при загрузке истории")
    }
  }

  const renderActions = (order) => (
    <OrderActions
      order={order}
      user={user}
      fetchHistory={fetchHistory}
      showDetails={showDetails}
      handleStatusChange={handleStatusChange}
      handleDeleteOrder={handleDeleteOrder}
      startEditOrder={startEditOrder}
    />
  )

  const showDetails = (order) => {
    setDetails(order)
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Оформление заказа</h2>
      <OrderForm
        form={form}
        managers={managers}
        customers={customers}
        userRole={userRole}
        description={description}
        dimensions={dimensions}
        images={images}
        handleInputChange={handleInputChange}
        setDescription={setDescription}
        handleDimensionChange={handleDimensionChange}
        addDimension={addDimension}
        uploadImage={uploadImage}
        handleSubmit={handleSubmit}
      />

      <OrdersTable
        orders={orders}
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        setStatusFilter={setStatusFilter}
        setDateFilter={setDateFilter}
        renderActions={renderActions}
      />

      <OrderHistory selectedOrderId={selectedOrderId} history={history} />

      <OrderDetails details={details} />
    </div>
  )
}
