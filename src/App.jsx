import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import RoleSelector from './views/RoleSelector.jsx'
import SpeOperatorView from './views/SpeOperatorView.jsx'
import DataHolderView from './views/DataHolderView.jsx'
import DataUserView from './views/DataUserView.jsx'
import AppShell from './components/AppShell.jsx'

export default function App() {
  const [role, setRole] = useState(null)

  if (!role) {
    return <RoleSelector onSelect={setRole} />
  }

  return (
    <AppShell role={role} onSwitchRole={() => setRole(null)}>
      <Routes>
        <Route path="/spe" element={<SpeOperatorView />} />
        <Route path="/holder" element={<DataHolderView />} />
        <Route path="/user" element={<DataUserView />} />
        <Route path="*" element={
          <Navigate to={role === 'spe' ? '/spe' : role === 'holder' ? '/holder' : '/user'} replace />
        } />
      </Routes>
    </AppShell>
  )
}
