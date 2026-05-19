import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users, Wallet } from 'lucide-react'
import { useData } from '../lib/data'

const NAV = [
  { to: '/',         label: 'Home',     Icon: LayoutDashboard },
  { to: '/events',   label: 'Events',   Icon: Calendar },
  { to: '/guests',   label: 'Guests',   Icon: Users },
  { to: '/expenses', label: 'Expenses', Icon: Wallet },
]

export default function Sidebar() {
  const { events } = useData()
  const nextEvent = events.find(e => new Date(e.date) >= new Date())

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="serif italic logo-text" style={{ fontSize: 22, color: '#c4a882', letterSpacing: '.02em' }}>
            Nikah Planner
          </div>
          <div style={{ fontSize: 11, color: 'rgba(240,237,232,.35)', marginTop: 3, letterSpacing: '.06em', textTransform: 'uppercase' }} className="logo-text">
            Wedding Organizer
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon size={17} strokeWidth={1.6} />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>
        {nextEvent && (
          <div style={{ padding: '0 12px 20px' }}>
            <div style={{ background: 'rgba(196,168,130,.07)', border: '1px solid rgba(196,168,130,.15)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(240,237,232,.35)', marginBottom: 6 }}>Next event</div>
              <div style={{ fontSize: 13, color: '#f0ede8', fontWeight: 500, marginBottom: 3 }}>{nextEvent.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(196,168,130,.7)' }}>{Math.ceil((new Date(nextEvent.date) - new Date()) / 86400000)} days away</div>
            </div>
          </div>
        )}
        <div style={{ padding: '16px 12px 24px', borderTop: '1px solid rgba(196,168,130,.1)', marginTop: 'auto' }}>
          <div style={{ fontSize: 11, color: 'rgba(240,237,232,.2)', textAlign: 'center' }}>✦ May Your Day Be Perfect ✦</div>
        </div>
      </aside>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
              <Icon size={22} strokeWidth={1.6} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
