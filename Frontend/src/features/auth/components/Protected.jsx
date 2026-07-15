import React, { useEffect } from 'react'
import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useAuth } from '../hook/useAuth.js'

const Protected = ({ children, role = "buyer" }) => {

  const { handleGetMe } = useAuth()
  const user = useSelector(state => state.auth.user)
  const loading = useSelector(state => state.auth.loading)

  useEffect(() => {
    handleGetMe()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }
  if (!user) {
    return <Navigate to="/login" />
  }

  if (user.role !== role) {
    return <Navigate to="/" />
  }

  return (
    <div>
      {children}
    </div>
  )
}

export default Protected