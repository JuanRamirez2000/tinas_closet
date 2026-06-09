export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-2">
      {children}
    </div>
  )
}
