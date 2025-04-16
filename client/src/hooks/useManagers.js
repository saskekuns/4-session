import { useState, useCallback } from "react"

export function useManagers() {
  const [managers, setManagers] = useState([])

  const fetchManagers = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/user/client-managers")
      const data = await res.json()
      setManagers(data)
    } catch {
      alert("Ошибка при загрузке менеджеров")
    }
  }, [])

  return { managers, fetchManagers }
}
