interface Props {
  label: string
  children: React.ReactNode // input or textarea
  error?: string
}

export default function Field({ label, children, error }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-ink-2 tracking-[-0.006em]">{label}</label>
      {children}
      {error && (
        <span className="text-[12px] text-urgent font-medium" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

// Shared input/textarea classes — exported so they stay consistent everywhere
export const inputCls = `w-full bg-surface border border-[var(--rule-strong)] rounded-input
  px-3.5 py-[13px] text-[15px] text-ink font-normal tracking-[-0.006em] leading-[1.4]
  outline-none focus:border-ink placeholder:text-ink-4`

export const textareaCls = `${inputCls} resize-none min-h-[80px] leading-[1.5] text-[14.5px]`
