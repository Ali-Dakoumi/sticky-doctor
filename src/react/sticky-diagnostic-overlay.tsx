'use client'

import { useCallback, useEffect, useState, type RefObject } from 'react'
import { analyzeStickyElement, type StickyDiagnosis } from '../core/analyze-sticky-element'

type Target = HTMLElement | null | RefObject<HTMLElement | null>
type Props = { target: Target; title?: string; className?: string; onDiagnosis?: (result: StickyDiagnosis) => void }

export function StickyDiagnosticOverlay({ target, title = 'Sticky diagnosis', className = '', onDiagnosis }: Props) {
  const [result, setResult] = useState<StickyDiagnosis | null>(null)
  const resolve = useCallback(() => {
    const element: HTMLElement | null = target && typeof target === 'object' && 'current' in target ? target.current : target
    const next = analyzeStickyElement(element)
    setResult(next)
    onDiagnosis?.(next)
  }, [target, onDiagnosis])
  useEffect(() => { resolve() }, [resolve])
  if (!result) return <div role="status" aria-live="polite" className={className}>Analyzing sticky element…</div>
  return <aside aria-label={title} className={`rounded-xl border bg-card p-4 text-card-foreground shadow-lg ${className}`}>
    <div className="flex items-center justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live check</p><h2 className="font-semibold">{title}</h2></div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${result.isSticky ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-destructive/15 text-destructive'}`}>{result.isSticky ? 'PASS' : 'FAIL'}</span>
    </div>
    {result.isSticky ? <p className="mt-4 text-sm text-muted-foreground">No sticky issues detected.</p> : <ul className="mt-4 flex flex-col gap-2 text-sm text-destructive">{result.issues.map((issue) => <li key={issue} className="flex gap-2"><span aria-hidden="true">•</span><span>{issue}</span></li>)}</ul>}
    <button type="button" onClick={resolve} className="mt-4 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted">Re-run analysis</button>
  </aside>
}
