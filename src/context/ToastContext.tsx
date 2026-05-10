/**
 * ToastContext.tsx
 * Shows small popup messages (toasts) anywhere in the app.
 * Any component can call showToast() to display a success, error, or info message.
 */

import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode, JSX } from 'react'

/* toast can only be one of these three types */
type ToastType = 'success' | 'error' | 'info'

/* shape of a single toast message */
interface Toast {
  id: number      /* unique id — used to remove the right toast later */
  message: string /* text shown in the toast */
  type: ToastType /* controls color and icon */
}

/* only exposes showToast to the rest of the app */
interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

/* creates the toast context box — starts as null */
const ToastContext = createContext<ToastContextValue | null>(null)

/* hook to call showToast from any component — throws error if used outside ToastProvider */
export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export const ToastProvider = ({ children }: { children: ReactNode }): JSX.Element => {

  /* list of currently visible toasts on screen */
  const [toasts, setToasts] = useState<Toast[]>([])

  /* adds a new toast to the list and auto-removes it after 3.5 seconds */
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() /* unique id based on current time */
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id)) /* remove this toast after 3.5s */
    }, 3500)
  }, [])

  /* SVG icons for each toast type */
  const icons = {
    success: (
      <svg className="h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="h-4 w-4 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    info: (
      <svg className="h-4 w-4 flex-shrink-0 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  }

  /* border color for each toast type */
  const borderColors = {
    success: 'border-emerald-500/30',
    error:   'border-red-500/30',
    info:    'border-blue-500/30',
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* toast container — fixed at top center of screen, above everything */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center">
        {toasts.map((toast) => (
          /* single toast card — styled based on type */
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-2xl border ${borderColors[toast.type]} bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl animate-fade-in-up max-w-sm`}
          >
            {/* icon on the left — changes based on type */}
            {icons[toast.type]}

            {/* toast message text */}
            <p className="text-sm text-slate-200">{toast.message}</p>

            {/* X button — manually closes this toast before 3.5s */}
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-auto flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}