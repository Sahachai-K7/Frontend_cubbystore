import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from '@/lib/auth-client'

export function EmailVerifiedPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data: session } = useSession()

  // Better-Auth appends ?error=... when verification fails (expired token, etc.)
  const error = params.get('error')

  useEffect(() => {
    if (error) return
    const t = setTimeout(() => {
      navigate(session ? '/' : '/login', { replace: true })
    }, 4000)
    return () => clearTimeout(t)
  }, [error, navigate, session])

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive" />
            <h1 className="text-xl font-semibold tracking-tight">
              ยืนยันอีเมลไม่สำเร็จ
            </h1>
            <p className="text-sm text-muted-foreground">
              ลิงก์อาจหมดอายุหรือถูกใช้ไปแล้ว — เข้าสู่ระบบแล้วกด "ส่งอีเมลยืนยันใหม่"
              จากแบนเนอร์ด้านบน
            </p>
            <p className="text-xs text-muted-foreground">
              รหัส: <code>{error}</code>
            </p>
            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline">
                <Link to="/login">เข้าสู่ระบบ</Link>
              </Button>
              <Button asChild>
                <Link to="/">หน้าแรก</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <h1 className="text-xl font-semibold tracking-tight">
            ยืนยันอีเมลเรียบร้อย 🎉
          </h1>
          <p className="text-sm text-muted-foreground">
            ขอบคุณที่ยืนยันอีเมล — ตอนนี้คุณสามารถซื้อสินค้าและรับของผ่าน
            อีเมลของคุณได้แล้ว
          </p>
          <p className="text-xs text-muted-foreground">
            ระบบจะพาคุณไปที่{session ? 'หน้าแรก' : 'หน้าเข้าสู่ระบบ'}อัตโนมัติใน 4 วินาที…
          </p>
          <Button asChild className="mt-2">
            <Link to={session ? '/' : '/login'}>
              {session ? 'ไปหน้าแรก' : 'เข้าสู่ระบบ'}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
