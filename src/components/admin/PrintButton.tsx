'use client'

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center px-4 py-2 rounded-[10px] bg-primary text-primary-ink
                 text-[13px] font-medium active:scale-[0.985] transition-transform"
    >
      Print / Save as PDF
    </button>
  )
}
