import { useState } from 'react'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { authClient, useSession } from '@/lib/auth-client'

export function EmailVerifyBanner({ className }: { className?: string }) {
  const { data: session } = useSession()
  const [pending, setPending] = useState(false)

  const u = session?.user as
    | { email: string; emailVerified?: boolean }
    | undefined
  if (!u || u.emailVerified) return null

  const onResend = async () => {
    setPending(true)
    try {
      const res = await authClient.sendVerificationEmail({
        email: u.email,
        callbackURL: new URL('/email-verified', window.location.origin).toString(),
      })
      if (res.error) throw new Error(res.error.message ?? 'send_failed')
      toast.success(`ส่ง email ยืนยันไปที่ ${u.email} แล้ว`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'ส่งไม่สำเร็จ')
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      className={`flex flex-col gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm sm:flex-row sm:items-center sm:justify-between ${className ?? ''}`}
    >
      <div className="flex items-start gap-2 text-amber-700 dark:text-amber-300">
        <Mail className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium">กรุณายืนยันอีเมล</p>
          <p className="mt-0.5 text-xs">
            เราจะส่งสินค้าไปที่อีเมลนี้ — เช็คให้แน่ใจว่าใช้งานได้จริง
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onResend}
        disabled={pending}
        className="shrink-0"
      >
        {pending ? 'กำลังส่ง…' : 'ส่ง email ยืนยันใหม่'}
      </Button>
    </div>
  )
}
