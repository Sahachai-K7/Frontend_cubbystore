import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmailVerifyBanner } from '@/components/EmailVerifyBanner'
import { authClient, useSession } from '@/lib/auth-client'

const NameSchema = z.object({
  name: z.string().min(1, 'ใส่ชื่อ').max(80),
})
type NameForm = z.infer<typeof NameSchema>

const PwSchema = z
  .object({
    currentPassword: z.string().min(1, 'ใส่รหัสผ่านปัจจุบัน'),
    newPassword: z.string().min(8, 'รหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร').max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'รหัสผ่านยืนยันไม่ตรงกัน',
  })
type PwForm = z.infer<typeof PwSchema>

export function ProfilePage() {
  const { data: session, refetch } = useSession()
  const u = session?.user as
    | { name?: string | null; email: string; emailVerified?: boolean }
    | undefined

  const nameForm = useForm<NameForm>({
    resolver: zodResolver(NameSchema),
    defaultValues: { name: u?.name ?? '' },
  })

  useEffect(() => {
    if (u) nameForm.reset({ name: u.name ?? '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [u?.name])

  const [savingName, setSavingName] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const onSaveName = async (v: NameForm) => {
    setSavingName(true)
    try {
      const res = await authClient.updateUser({ name: v.name })
      if (res.error) throw new Error(res.error.message ?? 'update_failed')
      toast.success('บันทึกชื่อแล้ว')
      refetch()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ')
    } finally {
      setSavingName(false)
    }
  }

  const pwForm = useForm<PwForm>({ resolver: zodResolver(PwSchema) })

  const onChangePw = async (v: PwForm) => {
    setSavingPw(true)
    try {
      const res = await authClient.changePassword({
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
        revokeOtherSessions: true,
      })
      if (res.error) throw new Error(res.error.message ?? 'change_failed')
      toast.success('เปลี่ยนรหัสผ่านแล้ว — session อื่นถูก logout')
      pwForm.reset()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
    } finally {
      setSavingPw(false)
    }
  }

  if (!u) {
    return <p className="px-4 py-8 text-sm text-muted-foreground">กำลังโหลด…</p>
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">โปรไฟล์</h1>

      <EmailVerifyBanner />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลบัญชี</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="อีเมล" value={u.email} hint={u.emailVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ชื่อที่จะแสดง</CardTitle>
          <CardDescription>ชื่อนี้จะแสดงในหน้ารีวิวและคำสั่งซื้อ</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={nameForm.handleSubmit(onSaveName)} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">ชื่อ</Label>
              <Input id="name" {...nameForm.register('name')} />
              {nameForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {nameForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={savingName}>
              {savingName ? 'กำลังบันทึก…' : 'บันทึก'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">เปลี่ยนรหัสผ่าน</CardTitle>
          <CardDescription>session อื่นทุกเครื่องจะถูก logout</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={pwForm.handleSubmit(onChangePw)} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...pwForm.register('currentPassword')}
              />
              {pwForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {pwForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...pwForm.register('newPassword')}
              />
              {pwForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">
                  {pwForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...pwForm.register('confirmPassword')}
              />
              {pwForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {pwForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={savingPw}>
              {savingPw ? 'กำลังเปลี่ยน…' : 'เปลี่ยนรหัสผ่าน'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}

function Row({
  label,
  value,
  hint,
}: {
  label: string
  value: React.ReactNode
  hint?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span>{value}</span>
        {hint && <span className="text-xs text-muted-foreground">({hint})</span>}
      </div>
    </div>
  )
}
