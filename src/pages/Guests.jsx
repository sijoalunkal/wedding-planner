import { useState } from 'react'
import { Plus, Trash2, Users, UserCheck, UserX, Clock, Search } from 'lucide-react'
import { useData } from '../lib/data'
import { useToast } from '../lib/toast'
import Modal from '../components/Modal'

const BLANK = { event_id:'', name:'', type:'individual', count:1, rsvp:'pending', phone:'', notes:'' }
const RSVP_COLOR = { confirmed:'#6dbb87', pending:'#7ab0f0', declined:'#e07070' }
const RSVP_BADGE = { confirmed:'badge-green', pending:'badge-blue', declined:'badge-red' }

export default function Guests() {
  const { events, guests, addGuest, updateGuest, deleteGuest, loading } = useData()
  const toast = useToast()
  const [filterEvent, setFilterEvent] = useState('all')
  const [filterRsvp, setFilterRsvp]   = useState('all')
  const [search, setSearch]           = useState('')
  const [modal, setModal]             = useState(false)
  const [form, setForm]               = useState(BLANK)
  const [saving, setSaving]           = useState(false)

  const openAdd = () => {
    setForm({ ...BLANK, event_id: events[0]?.id || '' })
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Guest name is required.', 'error'); return }
    if (!form.event_id)    { toast('Please select an event.', 'error'); return }
    setSaving(true)
    try {
      await addGuest({ ...form, count: Number(form.count) || 1 })
      setModal(false)
    } catch (e) { toast(e.message, 'error') }
    setSaving(false)
  }

  const updateRsvp = async (id, rsvp) => {
    try { await updateGuest(id, { rsvp }) }
    catch (e) { toast(e.message, 'error') }
  }

  const handleDelete = async (id) => {
    try { await deleteGuest(id) }
    catch (e) { toast(e.message, 'error') }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  let filtered = guests
  if (filterEvent !== 'all') filtered = filtered.filter(g => g.event_id === filterEvent)
  if (filterRsvp  !== 'all') filtered = filtered.filter(g => g.rsvp === filterRsvp)
  if (search.trim()) filtered = filtered.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))

  const total     = filtered.reduce((s,g)=>s+g.count,0)
  const confirmed = filtered.filter(g=>g.rsvp==='confirmed').reduce((s,g)=>s+g.count,0)
  const pending   = filtered.filter(g=>g.rsvp==='pending').reduce((s,g)=>s+g.count,0)
  const declined  = filtered.filter(g=>g.rsvp==='declined').reduce((s,g)=>s+g.count,0)

  if (loading) return <div className="loader"><div className="spin">◌</div> Loading…</div>

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Guest List</h1>
          <p className="page-sub">Track all attendees across events</p>
        </div>
        <button className="btn btn-gold" onClick={openAdd} disabled={events.length===0}>
          <Plus size={16} /> Add Guest
        </button>
      </div>

      {events.length === 0 && (
        <div className="card" style={{ textAlign:'center', padding:'24px', color:'rgba(240,237,232,.5)', marginBottom:16 }}>
          Please add at least one event before adding guests.
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label:'Total',     val:total,     Icon:Users,     color:'#c4a882' },
          { label:'Confirmed', val:confirmed, Icon:UserCheck, color:'#6dbb87' },
          { label:'Pending',   val:pending,   Icon:Clock,     color:'#7ab0f0' },
          { label:'Declined',  val:declined,  Icon:UserX,     color:'#e07070' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', color:'rgba(240,237,232,.4)' }}>{s.label}</div>
              <s.Icon size={14} color={s.color} strokeWidth={1.5} />
            </div>
            <div className="stat-num" style={{ color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:14 }}>
        <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(240,237,232,.35)' }} />
        <input className="inp" placeholder="Search guests…" value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:34 }} />
      </div>

      {/* Filter tabs */}
      <div className="pill-tabs">
        <button className={`pill${filterEvent==='all'?' active':''}`} onClick={()=>setFilterEvent('all')}>All Events</button>
        {events.map(e => (
          <button key={e.id} className={`pill${filterEvent===e.id?' active':''}`} onClick={()=>setFilterEvent(e.id)}>{e.name}</button>
        ))}
      </div>
      <div className="pill-tabs">
        {['all','confirmed','pending','declined'].map(r => (
          <button key={r} className={`pill${filterRsvp===r?' active':''}`} onClick={()=>setFilterRsvp(r)}>
            {r.charAt(0).toUpperCase()+r.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <div className="empty"><div className="empty-icon">👥</div><div>No guests found</div></div>
        : <>
            {/* Desktop table */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Type</th><th>Event</th><th>People</th><th>Phone</th><th>RSVP</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(g => {
                    const evName = events.find(e=>e.id===g.event_id)?.name || '—'
                    return (
                      <tr key={g.id}>
                        <td style={{ fontWeight:500 }}>
                          {g.name}
                          {g.notes && <div style={{ fontSize:12, color:'rgba(240,237,232,.4)', marginTop:2 }}>{g.notes}</div>}
                        </td>
                        <td><span className={`badge ${g.type==='group'?'badge-purple':'badge-blue'}`}>{g.type}</span></td>
                        <td style={{ color:'rgba(240,237,232,.6)', fontSize:13 }}>{evName}</td>
                        <td style={{ textAlign:'center' }}><span className="badge badge-gold">{g.count}</span></td>
                        <td style={{ color:'rgba(240,237,232,.5)', fontSize:13 }}>{g.phone || '—'}</td>
                        <td>
                          <select value={g.rsvp} onChange={e=>updateRsvp(g.id,e.target.value)}
                            style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:12, fontFamily:'inherit', outline:'none', color:RSVP_COLOR[g.rsvp] }}>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="declined">Declined</option>
                          </select>
                        </td>
                        <td>
                          <button className="btn btn-danger btn-sm" style={{ padding:'5px 9px' }} onClick={()=>handleDelete(g.id)}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mobile-cards">
              {filtered.map(g => {
                const evName = events.find(e=>e.id===g.event_id)?.name || '—'
                return (
                  <div key={g.id} className="list-card">
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(196,168,130,.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Users size={18} color="#c4a882" strokeWidth={1.5} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                        <div style={{ fontWeight:500, fontSize:15 }}>{g.name}</div>
                        <button onClick={()=>handleDelete(g.id)} style={{ background:'none', border:'none', color:'rgba(240,237,232,.3)', cursor:'pointer', flexShrink:0, padding:4 }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div style={{ fontSize:12, color:'rgba(240,237,232,.45)', marginTop:3 }}>
                        {evName} · {g.count} {g.count===1?'person':'people'}
                        {g.phone && ` · ${g.phone}`}
                      </div>
                      {g.notes && <div style={{ fontSize:12, color:'rgba(240,237,232,.35)', marginTop:2 }}>{g.notes}</div>}
                      <div style={{ display:'flex', gap:8, marginTop:10, alignItems:'center' }}>
                        <span className={`badge ${g.type==='group'?'badge-purple':'badge-blue'}`}>{g.type}</span>
                        <select value={g.rsvp} onChange={e=>updateRsvp(g.id,e.target.value)}
                          style={{ background:'rgba(196,168,130,.08)', border:'1px solid rgba(196,168,130,.2)', borderRadius:99, cursor:'pointer', fontSize:12, fontFamily:'inherit', outline:'none', color:RSVP_COLOR[g.rsvp], padding:'4px 10px' }}>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="declined">Declined</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
      }

      {modal && (
        <Modal title="Add Guest" onClose={()=>setModal(false)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }} className="form-grid">
            <div>
              <label className="lbl">Event *</label>
              <select className="inp" value={form.event_id} onChange={e=>f('event_id',e.target.value)}>
                <option value="">— Select —</option>
                {events.map(ev=><option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">Type</label>
              <select className="inp" value={form.type} onChange={e=>f('type',e.target.value)}>
                <option value="individual">Individual</option>
                <option value="group">Group / Family</option>
              </select>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label className="lbl">{form.type==='group'?'Family / Group Name':'Full Name'} *</label>
              <input className="inp" placeholder={form.type==='group'?'e.g. Khan Family':'Guest full name'} value={form.name} onChange={e=>f('name',e.target.value)} />
            </div>
            <div>
              <label className="lbl">No. of People</label>
              <input type="number" min={1} className="inp" value={form.count} onChange={e=>f('count',e.target.value)} />
            </div>
            <div>
              <label className="lbl">RSVP Status</label>
              <select className="inp" value={form.rsvp} onChange={e=>f('rsvp',e.target.value)}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
              </select>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label className="lbl">Phone (optional)</label>
              <input className="inp" placeholder="+92 300 0000000" value={form.phone} onChange={e=>f('phone',e.target.value)} />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label className="lbl">Notes (optional)</label>
              <input className="inp" placeholder="Dietary needs, special requests…" value={form.notes} onChange={e=>f('notes',e.target.value)} />
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-gold" style={{ flex:1 }} onClick={handleSave} disabled={saving}>
              {saving?'Adding…':'Add Guest'}
            </button>
            <button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
