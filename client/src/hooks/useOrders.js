import { useState, useCallback } from "react"

export function useOrders() {
  const [orders, setOrders] = useState([])

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch("http://localhost:3000/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Не удалось загрузить заказы")
      }

      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Ошибка при загрузке заказов:", error)
    }
  }, [])

  return { orders, fetchOrders }
}
