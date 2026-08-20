// components/AddressDisplay.tsx
interface AddressDisplayProps {
  address: string
  city?: string
}

const AddressDisplay = ({ address, city }: AddressDisplayProps) => {
  return (
    <div className="space-y-2">
      {address ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300">
          📍 {address}{city ? `, ${city}` : ''}
        </p>
      ) : (
        <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
          No address on file
        </p>
      )}
    </div>
  )
}

export default AddressDisplay