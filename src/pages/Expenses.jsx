import { useState } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { useData } from '../lib/data'
import { useToast } from '../lib/toast'
import Modal from '../components/Modal'

const CATEGORIES = ['Venue','Catering','Decor','Travel','Photography','Videography',
  'Music / DJ','Outfit / Dress','Jewelry','Invitation Cards','Gifts','Makeup / Hair',
  'Flowers','Lighting','Transportation','Accommodation','Miscellaneous']

const BLANK = { event_id:'', category:'Venue', description:'', amount:'', paid:false, notes:'' }
const fmt = n => Number(n).toLocaleString('en-US', { minimumFractionDigits:0 })

export default function Expenses() {
  const { events, expenses, addExpense, updateExpense, deleteExpense, loading } = useData()
  const toast = useToast()
  const [filterEvent, setFilterEvent] = useState('all')
  const [filterPaid,  setFilterPaid]  = useState('all')
  const [modal, setModal]             = useState(null)
  const [form, setForm]               = useState(BLANK)
  const [saving, setSaving]           = useState(false)

  const openAdd = () => { setForm({ ...BLANK, event_id: events[0]?.id || '' }); setModal('add') }
  const openEdit = (e) => { setForm({ event_id: e.event_id || '', category: e.category || 'Venue', description: e.description || '', amount: e.amount || '', paid: e.paid || false, notes: e.notes || '' }); setModal(e) }
  const closeModal = () => setModal(null)

  const handleSave = async () => {
    if (!form.description.trim())        { toast('Description is required.','error'); return }
    if (!form.amount || isNaN(form.amount)) { toast('Please enter a valid amount.','error'); return }
    setSaving(true)
    try {
      if (modal === 'add') await addExpense({ ...form, amount: parseFloat(form.amount) })
      else await updateExpense(modal.id, { ...form, amount: parseFloat(form.amount) })
      closeModal()
    }
    catch(e) { toast(e.message,'error') }
    setSaving(false)
  }

  const togglePaid = async (e) => {
    try { await updateExpense(e.id, { paid: !e.paid }) }
    catch(err) { toast(err.message,'error') }
  }

  const handleDelete = async (id) => {
    try { await deleteExpense(id) }
    catch(e) { toast(e.message,'error') }
  }

  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  let filtered = expenses
  if (filterEvent !== 'all') filtered = filtered.filter(e=>e.event_id===filterEvent)
  if (filterPaid  !== 'all') filtered = filtered.filter(e=>filterPaid==='paid'?e.paid:!e.paid)

  const total   = filtered.reduce((s,e)=>s+Number(e.amount),0)
  const paid    = filtered.filter(e=>e.paid).reduce((s,e)=>s+Number(e.amount),0)
  const due     = total-paid
  const paidPct = total ? Math.round((paid/total)*100) : 0

  const byCat = filtered.reduce((acc,e)=>{ acc[e.category]=(acc[e.category]||0)+Number(e.amount); return acc },{})

  const byEvent = events.map(ev=>({
    ev,
    total: expenses.filter(e=>e.event_id===ev.id).reduce((s,e)=>s+Number(e.amount),0),
    paid:  expenses.filter(e=>e.event_id===ev.id&&e.paid).reduce((s,e)=>s+Number(e.amount),0),
  }))

  if (loading) return <div className="loader"><div className="spin">◌</div> Loading…</div>

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-sub">Track every rupee of your budget</p>
        </div>
        <button className="btn btn-gold" onClick={openAdd} disabled={events.length===0}>
          <Plus size={16}/> Add Expense
        </button>
      </div>

      {events.length===0 && (
        <div className="card" style={{ textAlign:'center', padding:'24px', color:'rgba(240,237,232,.5)', marginBottom:16 }}>
          Please add at least one event before tracking expenses.
        </div>
      )}

      {/* Summary stats */}
      <div className="grid-3" style={{ marginBottom:16 }}>
        {[
          { label:'Total Budget',  val:`₨ ${fmt(total)}`, color:'#c4a882' },
          { label:'Paid',          val:`₨ ${fmt(paid)}`,  color:'#6dbb87' },
          { label:'Outstanding',   val:`₨ ${fmt(due)}`,   color:'#e07070' },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', color:'rgba(240,237,232,.4)', marginBottom:10 }}>{s.label}</div>
            <div className="stat-num" style={{ color:s.color, fontSize:22 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Progress card */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'rgba(240,237,232,.45)', marginBottom:8 }}>
          <span>Payment progress</span><span>{paidPct}%</span>
        </div>
        <div className="bar-track" style={{ height:10 }}>
          <div className="bar-fill" style={{ width:`${paidPct}%` }}/>
        </div>

        {byEvent.filter(x=>x.total>0).length>0 && (
          <>
            <hr className="divider"/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
              {byEvent.filter(x=>x.total>0).map(({ev,total:et,paid:ep})=>{
                const pct=et?Math.round((ep/et)*100):0
                return (
                  <div key={ev.id}>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
                      <div style={{ width:7,height:7,borderRadius:'50%',background:ev.color||'#8a7256'}}/>
                      <span style={{ fontSize:13, color:'rgba(240,237,232,.7)'}}>{ev.name}</span>
                    </div>
                    <div style={{ fontSize:13, color:'#c4a882', marginBottom:5}}>₨ {fmt(et)}</div>
                    <div className="bar-track" style={{ height:4}}>
                      <div className="bar-fill" style={{ width:`${pct}%`}}/>
                    </div>
                    <div style={{ fontSize:11, color:'rgba(240,237,232,.3)', marginTop:3}}>{pct}% paid</div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {Object.keys(byCat).length>0 && (
          <>
            <hr className="divider"/>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>(
                <div key={cat} style={{ background:'rgba(196,168,130,.07)', borderRadius:10, padding:'8px 12px', border:'1px solid rgba(196,168,130,.1)'}}>
                  <div style={{ fontSize:10, color:'rgba(240,237,232,.4)', marginBottom:3}}>{cat}</div>
                  <div style={{ fontSize:14, color:'#c4a882'}}>₨ {fmt(amt)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="pill-tabs">
        <button className={`pill${filterEvent==='all'?' active':''}`} onClick={()=>setFilterEvent('all')}>All Events</button>
        {events.map(e=>(
          <button key={e.id} className={`pill${filterEvent===e.id?' active':''}`} onClick={()=>setFilterEvent(e.id)}>{e.name}</button>
        ))}
      </div>
      <div className="pill-tabs">
        {['all','paid','unpaid'].map(v=>(
          <button key={v} className={`pill${filterPaid===v?' active':''}`} onClick={()=>setFilterPaid(v)}>
            {v.charAt(0).toUpperCase()+v.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length===0
        ? <div className="empty"><div className="empty-icon">💰</div><div>No expenses found</div></div>
        : <>
            {/* Desktop table */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th style={{width:44}}></th><th>Description</th><th>Category</th><th>Event</th><th style={{textAlign:'right'}}>Amount</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map(e=>{
                    const evName=events.find(ev=>ev.id===e.event_id)?.name||'—'
                    return (
                      <tr key={e.id} style={{ opacity:e.paid?.6:1 }}>
                        <td>
                          <button onClick={()=>togglePaid(e)} style={{ background:'none',border:'none',cursor:'pointer',color:e.paid?'#6dbb87':'rgba(240,237,232,.3)',padding:0}}>
                            {e.paid?<CheckCircle size={18}/>:<Circle size={18}/>}
                          </button>
                        </td>
                        <td>
                          <span style={{ textDecoration:e.paid?'line-through':'none',textDecorationColor:'rgba(240,237,232,.3)'}}>{e.description}</span>
                          {e.notes&&<div style={{ fontSize:11,color:'rgba(240,237,232,.35)',marginTop:2}}>{e.notes}</div>}
                        </td>
                        <td><span className="badge badge-gold">{e.category}</span></td>
                        <td style={{ fontSize:13,color:'rgba(240,237,232,.55)'}}>{evName}</td>
                        <td style={{ textAlign:'right',fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:e.paid?'#6dbb87':'#e07070'}}>₨ {fmt(e.amount)}</td>
                        <td>
                          <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" style={{ padding:'5px 9px'}} onClick={()=>openEdit(e)}><Edit2 size={13}/></button>
                            <button className="btn btn-danger btn-sm" style={{ padding:'5px 9px'}} onClick={()=>handleDelete(e.id)}><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop:'1px solid rgba(196,168,130,.2)'}}>
                    <td colSpan={4} style={{ padding:'13px 16px',fontSize:13,color:'rgba(240,237,232,.5)'}}>{filtered.length} items</td>
                    <td style={{ textAlign:'right',padding:'13px 16px',fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:'#c4a882'}}>₨ {fmt(total)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mobile-cards">
              {filtered.map(e=>{
                const evName=events.find(ev=>ev.id===e.event_id)?.name||'—'
                return (
                  <div key={e.id} className="list-card" style={{ opacity:e.paid?.7:1, borderLeft:`3px solid ${e.paid?'#6dbb87':'#e07070'}`}}>
                    <button onClick={()=>togglePaid(e)} style={{ background:'none',border:'none',cursor:'pointer',color:e.paid?'#6dbb87':'rgba(240,237,232,.3)',padding:0,paddingTop:2,flexShrink:0}}>
                      {e.paid?<CheckCircle size={22}/>:<Circle size={22}/>}
                    </button>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                        <span style={{ fontWeight:500, textDecoration:e.paid?'line-through':'none', textDecorationColor:'rgba(240,237,232,.3)', fontSize:14}}>{e.description}</span>
                        <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                          <button onClick={()=>openEdit(e)} style={{ background:'none',border:'none',color:'rgba(240,237,232,.5)',cursor:'pointer',padding:4}}>
                            <Edit2 size={15}/>
                          </button>
                          <button onClick={()=>handleDelete(e.id)} style={{ background:'none',border:'none',color:'rgba(240,237,232,.3)',cursor:'pointer',padding:4}}>
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize:12,color:'rgba(240,237,232,.45)',marginTop:3}}>{evName} · <span className="badge badge-gold" style={{ fontSize:10,padding:'2px 8px'}}>{e.category}</span></div>
                      {e.notes&&<div style={{ fontSize:11,color:'rgba(240,237,232,.35)',marginTop:3}}>{e.notes}</div>}
                      <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:e.paid?'#6dbb87':'#e07070',marginTop:6}}>₨ {fmt(e.amount)}</div>
                    </div>
                  </div>
                )
              })}
              {/* Total footer */}
              <div style={{ textAlign:'right',padding:'12px 4px',borderTop:'1px solid rgba(196,168,130,.12)',color:'rgba(240,237,232,.5)',fontSize:13}}>
                Total: <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:'#c4a882',marginLeft:8}}>₨ {fmt(total)}</span>
              </div>
            </div>
          </>
      }

      {modal && (
        <Modal title={modal === 'add' ? "Add Expense" : "Edit Expense"} onClose={closeModal}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }} className="form-grid">
            <div>
              <label className="lbl">Event</label>
              <select className="inp" value={form.event_id} onChange={e=>f('event_id',e.target.value)}>
                <option value="">— Select —</option>
                {events.map(ev=><option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">Category</label>
              <select className="inp" value={form.category} onChange={e=>f('category',e.target.value)}>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label className="lbl">Description *</label>
              <input className="inp" placeholder="e.g. Grand Hall booking deposit" value={form.description} onChange={e=>f('description',e.target.value)}/>
            </div>
            <div>
              <label className="lbl">Amount (₨) *</label>
              <input type="number" min={0} className="inp" placeholder="0" value={form.amount} onChange={e=>f('amount',e.target.value)}/>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, paddingTop:20 }}>
              <input type="checkbox" className="chk" id="paid-cb" checked={form.paid} onChange={e=>f('paid',e.target.checked)}/>
              <label htmlFor="paid-cb" style={{ fontSize:14, cursor:'pointer' }}>Already paid</label>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label className="lbl">Notes (optional)</label>
              <input className="inp" placeholder="Vendor name, invoice #…" value={form.notes} onChange={e=>f('notes',e.target.value)}/>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-gold" style={{ flex:1 }} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : modal === 'add' ? 'Add Expense' : 'Save Changes'}
            </button>
            <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
