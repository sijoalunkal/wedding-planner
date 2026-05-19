import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Events ───────────────────────────────────────────────────────────────
export const db = {
  events: {
    async list() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
      if (error) throw error
      return data
    },
    async create(event) {
      const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single()
      if (error) throw error
      return data
    },
    async update(id, updates) {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    async delete(id) {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
    },
  },

  // ── Guests ─────────────────────────────────────────────────────────────
  guests: {
    async list() {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    async create(guest) {
      const { data, error } = await supabase
        .from('guests')
        .insert(guest)
        .select()
        .single()
      if (error) throw error
      return data
    },
    async update(id, updates) {
      const { data, error } = await supabase
        .from('guests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    async delete(id) {
      const { error } = await supabase.from('guests').delete().eq('id', id)
      if (error) throw error
    },
  },

  // ── Expenses ────────────────────────────────────────────────────────────
  expenses: {
    async list() {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    async create(expense) {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single()
      if (error) throw error
      return data
    },
    async update(id, updates) {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    async delete(id) {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    },
  },
}
