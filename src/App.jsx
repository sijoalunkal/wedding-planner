import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './lib/toast'
import { DataProvider } from './lib/data'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Guests from './pages/Guests'
import Expenses from './pages/Expenses'

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="content">
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/events"   element={<Events />} />
          <Route path="/guests"   element={<Guests />} />
          <Route path="/expenses" element={<Expenses />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <DataProvider>
          <AppLayout />
        </DataProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
