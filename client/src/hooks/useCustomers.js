import { useState, useCallback } from "react"

export function useCustomers() {
  const [customers, setCustomers] = useState([])

  const fetchCustomers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3000/api/user/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      setCustomers(data)
    } catch {
      alert("Ошибка при загрузке заказчиков")
    }
  }, [])

  return { customers, fetchCustomers }
}
