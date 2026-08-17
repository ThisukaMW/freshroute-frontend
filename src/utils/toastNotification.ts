/**
 * Simple Toast notification system for temporary alerts
 */

export interface ToastOptions {
  duration?: number; // milliseconds
  type?: 'success' | 'error' | 'warning' | 'info';
}

let toastContainer: HTMLDivElement | null = null;

const getToastContainer = (): HTMLDivElement => {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    toastContainer.className = 'fixed top-15 right-4 z-50 space-y-2 pointer-events-none'
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

export const showToast = (message: string, options: ToastOptions = {}) => {
  const { duration = 3000, type = 'info' } = options
  const container = getToastContainer()

  const toast = document.createElement('div')
  toast.className = `
    rounded-lg px-4 py-3 text-sm font-medium text-white
    animate-fade-in pointer-events-auto
    ${type === 'success' ? 'bg-emerald-600' : ''}
    ${type === 'error' ? 'bg-red-600' : ''}
    ${type === 'warning' ? 'bg-amber-600' : ''}
    ${type === 'info' ? 'bg-blue-600' : ''}
  `
  toast.textContent = message

  container.appendChild(toast)

  // Auto-remove after duration
  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity')
    setTimeout(() => {
      container.removeChild(toast)
    }, 300)
  }, duration)

  return toast
}

export const showErrorToast = (message: string) => showToast(message, { type: 'error' })
export const showSuccessToast = (message: string) => showToast(message, { type: 'success' })
export const showWarningToast = (message: string) => showToast(message, { type: 'warning' })
export const showInfoToast = (message: string) => showToast(message, { type: 'info' })
