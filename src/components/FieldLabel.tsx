export default function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-1.5">
      {children}
    </div>
  )
}
