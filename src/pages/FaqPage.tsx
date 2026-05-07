import { Link } from 'react-router-dom'

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: 'ส่งของยังไง / นานแค่ไหน?',
    a: (
      <>
        หลังจากชำระเสร็จ ระบบจะดึงไอดี/ไอเทมจากคลังแล้ว
        ส่งให้ทางอีเมลที่ลงทะเบียนภายในไม่กี่วินาที
        ดูประวัติย้อนหลังได้ที่หน้า{' '}
        <Link to="/orders" className="text-primary hover:underline">
          ประวัติคำสั่งซื้อ
        </Link>
      </>
    ),
  },
  {
    q: 'ทำไมต้องเติมเงินก่อนซื้อ ไม่จ่ายตรงเลยได้ไหม?',
    a: 'ระบบใช้กระเป๋าเงินภายในเพื่อให้ checkout เร็วขึ้น (กดปุ่มเดียว) และเพื่อให้ ระบบจับคู่การจ่ายเงินกับออเดอร์ได้แม่นยำ การเติมล่วงหน้าทำให้ไม่ต้องสแกน QR ทุกครั้งที่ซื้อ',
  },
  {
    q: 'อีเมลไม่ได้รับ ทำยังไง?',
    a: (
      <>
        <ol className="ml-5 list-decimal space-y-1">
          <li>เช็คกล่อง junk/spam ของอีเมล</li>
          <li>
            เปิดหน้า{' '}
            <Link to="/orders" className="text-primary hover:underline">
              ประวัติคำสั่งซื้อ
            </Link>{' '}
            — credentials ทั้งหมดเก็บไว้ที่นั่น คัดลอกได้ทันที
          </li>
          <li>
            หากยังไม่พบ ติดต่อแอดมินผ่านปุ่ม "ติดต่อ" ในเว็บ
            เราจะ resend ให้ใหม่
          </li>
        </ol>
      </>
    ),
  },
  {
    q: 'ไอดีที่ซื้อใช้ไม่ได้ ทำยังไง?',
    a: 'ติดต่อแอดมินภายใน 24 ชั่วโมงพร้อมหมายเลขออเดอร์ แอดมินจะตรวจสอบและ คืนเงินเข้ากระเป๋าหรือส่งของให้ใหม่ — เงื่อนไขดูที่หน้า "เงื่อนไขการให้บริการ" ข้อ 4',
  },
  {
    q: 'ถอนเงินจากกระเป๋ากลับมาเป็นเงินสดได้ไหม?',
    a: 'ไม่ได้ครับ — กระเป๋าเงินใช้ซื้อสินค้าในเว็บนี้เท่านั้น เพื่อกัน abuse และทำให้ราคาสินค้าถูกลง',
  },
  {
    q: 'ใช้ Google sign in กับ email/password ได้ทั้งคู่ไหม?',
    a: 'ได้ครับ ถ้าใช้อีเมลเดียวกัน — ระบบจะ link account ให้อัตโนมัติ',
  },
  {
    q: 'อยากเติมเงินก้อนใหญ่ ระบบรองรับไหม?',
    a: 'รองรับสูงสุด 50,000 บาทต่อครั้ง ถ้าต้องการมากกว่านั้น เติมหลายครั้งได้ ไม่มีจำกัดยอดสะสม',
  },
  {
    q: 'มีโปรโมชั่นไหม?',
    a: 'มีโค้ดส่วนลดเป็นช่วง ๆ ติดตามได้ทาง LINE/Discord ของร้าน (ปุ่ม "ติดต่อ") ใส่โค้ดได้ตอน checkout',
  },
]

export function FaqPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        คำถามที่พบบ่อย
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        ตอบคำถามที่ลูกค้ามักถาม — ถ้ายังไม่เจอที่ต้องการ ติดต่อทาง LINE/Discord
        ของเรา
      </p>

      <div className="space-y-2">
        {faqs.map((f, i) => (
          <details
            key={i}
            className="group rounded-md border bg-card p-4 transition-colors open:bg-muted/30"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-base font-medium">
              <span>{f.q}</span>
              <span className="text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </article>
  )
}
