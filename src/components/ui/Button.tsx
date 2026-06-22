import { forwardRef } from 'react'

type Variant = 'berry' | 'ink' | 'light' | 'ghost' | 'onhero' | 'accent'
type Size = 'sm' | 'md' | 'lg'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  full?: boolean
  pending?: boolean
  children: React.ReactNode
}

const variantCls: Record<Variant, string> = {
  berry: 'bg-primary text-primary-ink',
  ink: 'bg-ink text-bg',
  light: 'bg-white text-primary font-semibold',
  ghost: 'bg-transparent text-ink shadow-[inset_0_0_0_1px_var(--rule-strong)]',
  onhero: 'bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]',
  accent: 'bg-accent text-white',
}
const sizeCls: Record<Size, string> = {
  sm: 'px-3 py-2 text-[12.5px] rounded-[10px] gap-[5px] [&_svg]:w-3.5 [&_svg]:h-3.5',
  md: 'px-4 py-[13px] text-[14px] rounded-[13px] [&_svg]:w-4 [&_svg]:h-4',
  lg: 'px-5 py-[15px] text-[15px] rounded-[14px] [&_svg]:w-4 [&_svg]:h-4',
}

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'ink', size = 'md', full, pending, className, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap
                  font-medium leading-none transition-transform duration-75 active:scale-[0.985]
                  disabled:opacity-60 disabled:pointer-events-none
                  ${variantCls[variant]} ${sizeCls[size]} ${full ? 'w-full' : ''} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </button>
  )
})
export default Button
