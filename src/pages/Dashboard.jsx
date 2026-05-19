import { useNavigate } from 'react-router-dom'
import { useData } from '../lib/data'
import { format, differenceInDays } from 'date-fns'
import { Calendar, Users, Wallet, TrendingUp } from 'lucide-react'

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })
const EVENT_TYPE_BADGE = {
  wedding: 'badge-gold', engagement: 'badge-blue', mehendi: 'badge-green',
  mayun: 'badge-orange', valima: 'badge-purple', other: 'badge-gold',
}

export default function Dashboard() {
  const { events, guests, expenses, loading } = useData()
  const navigate = useNavigate()

  if (loading) return <div className="loader"><div className="spin">◌</div> Loading…</div>

  const today = new Date()
  const nextEvent = events.find(e => new Date(e.date) >= today)
  const daysLeft  = nextEvent ? differenceInDays(new Date(nextEvent.date), today) : null

  const totalGuests     = guests.reduce((s, g) => s + g.count, 0)
  const confirmedGuests = guests.filter(g => g.rsvp === 'confirmed').reduce((s, g) => s + g.count, 0)
  const totalBudget     = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const totalPaid       = expenses.filter(e => e.paid).reduce((s, e) => s + Number(e.amount), 0)
  const paidPct         = totalBudget ? Math.round((totalPaid / totalBudget) * 100) : 0

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})

  return (
    <div className="fade-up">
      {/* Hero header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="serif italic" style={{ fontSize: 44, fontWeight: 300, color: '#c4a882' }}>
          Your Wedding Journey
        </h1>
        <p style={{ color: 'rgba(240,237,232,.45)', marginTop: 6, fontSize: 15 }}>
          {format(today, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Countdown banner */}
      {nextEvent && (
        <div className="card" style={{
          marginBottom: 24, display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 20,
          background: 'linear-gradient(135deg,#1c1814 0%,#211a12 100%)',
          border: '1px solid rgba(196,168,130,.28)',
        }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(240,237,232,.4)', marginBottom: 8 }}>
              Next Event
            </div>
            <div className="serif" style={{ fontSize: 28, color: '#f0ede8' }}>{nextEvent.name}</div>
            <div style={{ fontSize: 13, color: 'rgba(240,237,232,.5)', marginTop: 5 }}>
              {format(new Date(nextEvent.date), 'EEEE, MMMM d, yyyy')}
              {nextEvent.time && ` · ${nextEvent.time}`}
              {nextEvent.venue && ` · ${nextEvent.venue}`}
            </div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div className="serif" style={{ fontSize: 72, lineHeight: 1, color: '#c4a882', fontWeight: 300 }}>
              {daysLeft}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(240,237,232,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 4 }}>
              days away
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Events', value: events.length, sub: `${events.filter(e=>new Date(e.date)>=today).length} upcoming`, icon: Calendar, click: '/events' },
          { label: 'Total Guests', value: totalGuests, sub: `${confirmedGuests} confirmed`, icon: Users, click: '/guests' },
          { label: 'Total Budget', value: `₨ ${fmt(totalBudget)}`, sub: `${paidPct}% paid`, icon: Wallet, click: '/expenses' },
          { label: 'Amount Due', value: `₨ ${fmt(totalBudget - totalPaid)}`, sub: 'outstanding', icon: TrendingUp, click: '/expenses' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(s.click)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(240,237,232,.4)' }}>{s.label}</div>
              <div style={{ background: 'rgba(196,168,130,.1)', borderRadius: 8, padding: 7 }}>
                <s.icon size={16} color="#c4a882" strokeWidth={1.5} />
              </div>
            </div>
            <div className="stat-num">{s.value}</div>
            <div className="stat-label">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two column: events list + expense breakdown */}
      <div className="grid-2" style={{ gap: 20 }}>
        {/* Events */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="serif" style={{ fontSize: 20 }}>Events Timeline</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>View all</button>
          </div>
          {events.length === 0
            ? <div className="empty"><div className="empty-icon">📅</div><div>No events yet</div></div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {events.slice(0, 5).map(e => (
                  <div key={e.id} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 3, height: 44, borderRadius: 99, background: e.color || '#8a7256', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(240,237,232,.45)', marginTop: 2 }}>
                        {format(new Date(e.date), 'MMM d, yyyy')}
                        {e.time && ` · ${e.time}`}
                      </div>
                    </div>
                    <span className={`badge ${EVENT_TYPE_BADGE[e.type] || 'badge-gold'}`}>{e.type}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Expense overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="serif" style={{ fontSize: 20 }}>Expense Overview</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/expenses')}>View all</button>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(240,237,232,.45)', marginBottom: 8 }}>
              <span>₨ {fmt(totalPaid)} paid</span>
              <span>₨ {fmt(totalBudget)} total</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${paidPct}%` }} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(240,237,232,.3)', marginTop: 6 }}>{paidPct}% completed</div>
          </div>
          <hr className="divider" />
          {Object.keys(byCategory).length === 0
            ? <div className="empty" style={{ padding: '20px 0' }}><div>No expenses yet</div></div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([cat, amt]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'rgba(240,237,232,.65)' }}>{cat}</span>
                    <span style={{ fontSize: 13, color: '#c4a882' }}>₨ {fmt(amt)}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* Guest RSVP summary per event */}
      {events.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="serif" style={{ fontSize: 20 }}>Guest Summary by Event</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/guests')}>Manage guests</button>
            </div>
            <div className="grid-2" style={{ gap: 14 }}>
              {events.map(ev => {
                const evGuests = guests.filter(g => g.event_id === ev.id)
                const total = evGuests.reduce((s,g) => s+g.count, 0)
                const confirmed = evGuests.filter(g=>g.rsvp==='confirmed').reduce((s,g)=>s+g.count,0)
                const pct = total ? Math.round((confirmed/total)*100) : 0
                return (
                  <div key={ev.id} style={{ background: 'rgba(196,168,130,.05)', borderRadius: 12, padding: '16px', border: '1px solid rgba(196,168,130,.1)' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: ev.color || '#8a7256', flexShrink: 0 }} />
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{ev.name}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                      <span style={{ color: '#c4a882' }}>{total} invited</span>
                      <span style={{ color: '#6dbb87' }}>{confirmed} confirmed</span>
                      <span style={{ color: 'rgba(240,237,232,.4)' }}>{pct}%</span>
                    </div>
                    <div className="bar-track" style={{ marginTop: 10, height: 4 }}>
                      <div className="bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
