export function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 prose prose-zinc dark:prose-invert">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        นโยบายความเป็นส่วนตัว
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}
      </p>

      <Section title="1. ข้อมูลที่เราเก็บ">
        <p>เราเก็บข้อมูลที่จำเป็นสำหรับการให้บริการเท่านั้น ได้แก่:</p>
        <ul>
          <li>
            <strong>ข้อมูลบัญชี</strong> — อีเมล, ชื่อที่แสดง, รหัสผ่าน (เก็บแบบ
            hash ไม่สามารถถอดกลับได้)
          </li>
          <li>
            <strong>ข้อมูลธุรกรรม</strong> — ประวัติการเติมเงิน คำสั่งซื้อ
            และยอดในกระเป๋าเงิน
          </li>
          <li>
            <strong>ข้อมูลสินค้าที่ส่ง</strong> — credentials ของไอดี/ไอเทมที่ขายผ่านเว็บ
          </li>
          <li>
            <strong>ข้อมูล session</strong> — IP address, User-Agent, เวลาที่ login
            เพื่อความปลอดภัย
          </li>
        </ul>
      </Section>

      <Section title="2. การใช้ข้อมูล">
        <p>เราใช้ข้อมูลของคุณเพื่อ:</p>
        <ul>
          <li>ส่งสินค้าทางอีเมลหลังการชำระเงิน</li>
          <li>ยืนยันตัวตน + กันการใช้งานผิดประเภท</li>
          <li>แจ้งเตือนเมื่อสินค้าใน wishlist กลับมาขาย (ถ้าคุณสมัคร)</li>
          <li>วิเคราะห์การขายภายในเพื่อปรับปรุงร้าน</li>
        </ul>
        <p>
          เราไม่ขายข้อมูลของคุณให้บุคคลที่ 3
          ไม่ใช่ส่วนหนึ่งของเครือข่ายโฆษณา
        </p>
      </Section>

      <Section title="3. บุคคลที่ 3 ที่เราใช้">
        <ul>
          <li>
            <strong>Resend</strong> — ส่งอีเมลธุรกรรม (resend.com) ข้อมูลที่ส่งคือ
            อีเมลของคุณ + เนื้อหาออเดอร์
          </li>
          <li>
            <strong>Google OAuth</strong> — สำหรับ "Sign in with Google"
            (ถ้าคุณเลือกใช้) Google จะเห็นเพียงว่าคุณ login เข้าเว็บนี้
          </li>
          <li>
            <strong>Cloudflare</strong> — CDN/proxy หน้าเว็บ
          </li>
        </ul>
      </Section>

      <Section title="4. การเก็บรักษา">
        <p>
          ข้อมูลบัญชีและประวัติคำสั่งซื้อเก็บไว้ตราบเท่าที่บัญชีของคุณยังมีอยู่
          การลบบัญชีจะลบข้อมูลส่วนตัวออก ยกเว้นที่จำเป็นต่อการบัญชี/กฎหมาย
          (เก็บไม่เกิน 5 ปี)
        </p>
      </Section>

      <Section title="5. สิทธิของคุณ">
        <ul>
          <li>ขอสำเนาข้อมูลที่เราเก็บได้ทุกเมื่อ</li>
          <li>ขอแก้ไขข้อมูลที่ผิดได้</li>
          <li>ขอลบบัญชีและข้อมูลส่วนตัวได้</li>
        </ul>
        <p>ติดต่อทางช่อง LINE/Discord ของร้านที่ปุ่ม "ติดต่อ" ในหน้าเว็บ</p>
      </Section>

      <Section title="6. คุกกี้">
        <p>
          เราใช้คุกกี้เพียงเพื่อเก็บ session login เท่านั้น ไม่มี cookie โฆษณา
          หรือ tracking cross-site ใด ๆ
        </p>
      </Section>

      <Section title="7. การเปลี่ยนแปลงนโยบาย">
        <p>
          เราอาจปรับนโยบายนี้ตามความจำเป็น
          การเปลี่ยนแปลงสำคัญจะแจ้งทางอีเมลที่ลงทะเบียนไว้
          การใช้งานต่อหลังการอัปเดตถือว่าคุณยอมรับ
        </p>
      </Section>
    </article>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_li]:my-1 [&_strong]:text-foreground [&_ul]:ml-5 [&_ul]:list-disc">
        {children}
      </div>
    </section>
  )
}
