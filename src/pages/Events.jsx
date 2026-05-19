import { useState } from 'react'
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, Users, Wallet } from 'lucide-react'
import { format } from 'date-fns'
import { useData } from '../lib/data'
import { useToast } from '../lib/toast'
import Modal from '../components/Modal'

const EVENT_TYPES = ['wedding', 'engagement', 'mehendi', 'mayun', 'valima', 'other']
const COLORS = ['#c4a882','#fb923c','#c084fc','#f472b6','#34d399','#60a5fa','#f87171','#facc15']
const TYPE_BADGE = {
  wedding:'badge-gold', engagement:'badge-blue', mehendi:'badge-green',
  mayun:'badge-orange', valima:'badge-purple', other:'badge-gold',
}
const BLANK = { name:'', type:'wedding', date:'', time:'', venue:'', notes:'', color:'#c4a882' }

export default function Events() {
  const { events, guests, expenses, addEvent, updateEvent, deleteEvent, loading } = useData()
  const toast = useToast()
  const [modal, setModal] = useState(null) // null | 'add' | {event}
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  const openAdd   = () => { setForm(BLANK); setModal('add') }
  const openEdit  = (e) => { setForm({ name:e.name, type:e.type, date:e.date, time:e.time||'', venue:e.venue||'', notes:e.notes||'', color:e.color||'#c4a882' }); setModal(e) }
  const closeModal = () => setModal(null)

  const handleSave = async () => {
    if (!form.name.trim() || !form.date) { toast('Name and date are required.', 'error'); return }
    setSaving(true)
    try {
      if (modal === 'add') await addEvent(form)
      else await updateEvent(modal.id, form)
      closeModal()
    } catch (e) { toast(e.message, 'error') }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event and all its guests/expenses?')) return
    try { await deleteEvent(id) }
    catch (e) { toast(e.message, 'error') }
  }

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  if (loading) return <div className="loader"><div className="spin">◌</div> Loading…</div>

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-sub">Plan and manage your wedding events</p>
        </div>
        <button className="btn btn-gold" onClick={openAdd}>
          <Plus size={16} /> Add Event
        </button>
      </div>

      {events.length === 0 && (
        <div className="empty">
          <div className="empty-icon">📅</div>
          <div className="serif italic" style={{ fontSize: 20, marginBottom: 8 }}>No events yet</div>
          <div style={{ marginBottom: 20 }}>Add your first wedding event to get started</div>
          <button className="btn btn-gold" onClick={openAdd}><Plus size={16}/> Add your first event</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {events.map(e => {
          const evGuests  = guests.filter(g => g.event_id === e.id)
          const gCount    = evGuests.reduce((s,g) => s+g.count, 0)
          const budget    = expenses.filter(x => x.event_id === e.id).reduce((s,x) => s+Number(x.amount), 0)
          const isPast    = new Date(e.date) < new Date()
          return (
            <div key={e.id} className="card fade-up" style={{
              borderLeft: `3px solid ${e.color || '#8a7256'}`,
              opacity: isPast ? .7 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span className="serif" style={{ fontSize: 24 }}>{e.name}</span>
                    <span className={`badge ${TYPE_BADGE[e.type] || 'badge-gold'}`}>{e.type}</span>
                    {isPast && <span className="badge badge-red">Past</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: 'rgba(240,237,232,.55)' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <Calendar size={13} /> {format(new Date(e.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                    {e.time && <span style={{ display:'flex', alignItems:'center', gap:5 }}><Clock size={13}/> {e.time}</span>}
                    {e.venue && <span style={{ display:'flex', alignItems:'center', gap:5 }}><MapPin size={13}/> {e.venue}</span>}
                  </div>
                  {e.notes && (
                    <div style={{ marginTop: 10, fontSize: 13, color: 'rgba(240,237,232,.4)', fontStyle: 'italic', borderLeft: '2px solid rgba(196,168,130,.2)', paddingLeft: 12 }}>
                      {e.notes}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 13 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:5, color:'#c4a882' }}>
                      <Users size={13} /> {gCount} {gCount===1?'guest':'guests'}
                    </span>
                    <span style={{ display:'flex', alignItems:'center', gap:5, color:'#c4a882' }}>
                      <Wallet size={13} /> ₨ {Number(budget).toLocaleString()} budgeted
                    </span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)} style={{ padding:'8px 12px' }}>
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)} style={{ padding:'8px 12px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'New Event' : 'Edit Event'} onClose={closeModal}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }} className="form-grid">
            <div style={{ gridColumn:'1/-1' }}>
              <label className="lbl">Event Name *</label>
              <input className="inp" placeholder="e.g. Wedding Reception" value={form.name} onChange={e=>f('name',e.target.value)} />
            </div>
            <div>
              <label className="lbl">Event Type</label>
              <select className="inp" value={form.type} onChange={e=>f('type',e.target.value)}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">Date *</label>
              <input type="date" className="inp" value={form.date} onChange={e=>f('date',e.target.value)} />
            </div>
            <div>
              <label className="lbl">Time</label>
              <input type="time" className="inp" value={form.time} onChange={e=>f('time',e.target.value)} />
            </div>
            <div>
              <label className="lbl">Venue</label>
              <input className="inp" placeholder="Hall name, city…" value={form.venue} onChange={e=>f('venue',e.target.value)} />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label className="lbl">Notes</label>
              <textarea className="inp" placeholder="Additional details…" value={form.notes} onChange={e=>f('notes',e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 22 }}>
            <label className="lbl">Color Tag</label>
            <div style={{ display:'flex', gap:10, marginTop:6 }}>
              {COLORS.map(c => (
                <div key={c} onClick={()=>f('color',c)}
                  style={{ width:26, height:26, borderRadius:'50%', background:c, cursor:'pointer',
                    outline: form.color===c ? '2px solid #fff' : 'none', outlineOffset:2, transition:'transform .15s' }} />
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : modal==='add' ? 'Add Event' : 'Save Changes'}
            </button>
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
