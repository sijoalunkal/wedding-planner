import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db } from './supabase'
import { useToast } from './toast'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const toast = useToast()
  const [events, setEvents] = useState([])
  const [guests, setGuests] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [ev, gu, ex] = await Promise.all([
        db.events.list(),
        db.guests.list(),
        db.expenses.list(),
      ])
      setEvents(ev)
      setGuests(gu)
      setExpenses(ex)
    } catch (e) {
      console.error(e)
      toast('Failed to load data. Check your connection.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Events ──────────────────────────────────────────────────────────────
  const addEvent = async (data) => {
    const row = await db.events.create(data)
    setEvents(ev => [...ev, row].sort((a,b) => new Date(a.date)-new Date(b.date)))
    toast('Event added!')
    return row
  }
  const updateEvent = async (id, data) => {
    const row = await db.events.update(id, data)
    setEvents(ev => ev.map(e => e.id === id ? row : e))
    toast('Event updated!')
  }
  const deleteEvent = async (id) => {
    await db.events.delete(id)
    setEvents(ev => ev.filter(e => e.id !== id))
    setGuests(gs => gs.filter(g => g.event_id !== id))
    setExpenses(ex => ex.filter(e => e.event_id !== id))
    toast('Event deleted.')
  }

  // ── Guests ──────────────────────────────────────────────────────────────
  const addGuest = async (data) => {
    const row = await db.guests.create(data)
    setGuests(gs => [row, ...gs])
    toast('Guest added!')
    return row
  }
  const updateGuest = async (id, data) => {
    const row = await db.guests.update(id, data)
    setGuests(gs => gs.map(g => g.id === id ? row : g))
  }
  const deleteGuest = async (id) => {
    await db.guests.delete(id)
    setGuests(gs => gs.filter(g => g.id !== id))
    toast('Guest removed.')
  }

  // ── Expenses ────────────────────────────────────────────────────────────
  const addExpense = async (data) => {
    const row = await db.expenses.create(data)
    setExpenses(ex => [row, ...ex])
    toast('Expense added!')
    return row
  }
  const updateExpense = async (id, data) => {
    const row = await db.expenses.update(id, data)
    setExpenses(ex => ex.map(e => e.id === id ? row : e))
  }
  const deleteExpense = async (id) => {
    await db.expenses.delete(id)
    setExpenses(ex => ex.filter(e => e.id !== id))
    toast('Expense removed.')
  }

  return (
    <DataContext.Provider value={{
      events, guests, expenses, loading,
      addEvent, updateEvent, deleteEvent,
      addGuest, updateGuest, deleteGuest,
      addExpense, updateExpense, deleteExpense,
      reload: load,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
