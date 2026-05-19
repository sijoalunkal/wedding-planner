import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-handle" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="serif italic" style={{ fontSize: 24, fontWeight: 300 }}>{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '8px 10px', minHeight: 40 }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
