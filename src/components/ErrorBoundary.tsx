import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-3xl">😵</p>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">
          เกิดข้อผิดพลาด
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          หน้านี้โหลดไม่สำเร็จ ลอง refresh หรือกลับไปหน้าก่อนหน้า
        </p>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            รายละเอียด (สำหรับนักพัฒนา)
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-md border bg-muted/30 p-2 text-left font-mono text-[11px]">
            {this.state.error.message}
            {this.state.error.stack ? '\n\n' + this.state.error.stack : ''}
          </pre>
        </details>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={this.reset}
            className="rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-accent"
          >
            ลองใหม่
          </button>
          <a
            href="/"
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
          >
            กลับหน้าแรก
          </a>
        </div>
      </div>
    )
  }
}
