import Image from 'next/image'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="max-w-[430px] mx-auto h-[100dvh] flex flex-col px-[26px] pt-[52px]"
         style={{ background: 'linear-gradient(176deg, var(--bg) 0%, var(--bg) 60%, var(--surface-warm) 100%)' }}>
      <div className="w-14 h-14 bg-primary rounded-[17px] flex items-center justify-center mb-7"
           style={{ boxShadow: '0 16px 38px -18px rgba(107,37,64,0.55)' }}>
        <Image src="/logo-white.svg" alt="SaltCity" width={37} height={37} priority className="w-[37px] h-auto" />
      </div>
      <h1 className="text-[32px] font-medium tracking-[-0.03em] leading-[1.05] text-ink mb-2">
        Welcome <em className="font-serif italic font-normal text-primary">back.</em>
      </h1>
      <p className="text-[14px] text-ink-2 mb-[30px] tracking-[-0.006em] leading-[1.45]">
        Sign in to lead your company.
      </p>
      <LoginForm />
      <div className="mt-auto pb-[34px] text-center">
        <div className="font-serif italic text-[14px] text-ink-2">
          &ldquo;Walk gently. Lead faithfully.&rdquo;
        </div>
        <div className="mt-2 text-[11.5px] text-ink-3">SaltCity Leadership · v1.4</div>
      </div>
    </div>
  )
}
