import { Link } from 'react-router-dom'

export function PlaceholderPage({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {hint && <p className="mt-2 text-muted-foreground">{hint}</p>}
      <Link to="/" className="mt-6 inline-flex text-primary underline-offset-4 hover:underline">
        ← กลับหน้าแรก
      </Link>
    </div>
  )
}
