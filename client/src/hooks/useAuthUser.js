import { useState, useEffect } from "react"

export function useAuthUser() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState("")

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"))
    setUser(savedUser)
    setUserRole(savedUser?.role || "")
  }, [])

  return { user, userRole }
}
