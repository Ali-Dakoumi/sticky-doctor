import { describe, expect, it, vi } from 'vitest'
import { analyzeStickyElement } from '../src/core/analyze-sticky-element'

function fixture(css: Partial<CSSStyleDeclaration> = {}, parentCss: Partial<CSSStyleDeclaration> = {}) {
  const parent = document.createElement('div'); const el = document.createElement('div'); parent.append(el); document.body.append(parent)
  const defaults = { position: 'sticky', display: 'block', top: '10px', bottom: 'auto', left: 'auto', right: 'auto', alignSelf: 'auto' }
  const computed = (node: Element) => ({ ...defaults, overflow: 'visible', overflowY: 'visible', overflowX: 'visible', transform: 'none', perspective: 'none', filter: 'none', flexDirection: 'row', alignItems: 'normal', ...(node === el ? css : parentCss), paddingTop: '0px', paddingBottom: '0px', paddingLeft: '0px', paddingRight: '0px', getPropertyValue(name: string) { return (this as Record<string, string>)[name] ?? '' } }) as unknown as CSSStyleDeclaration
  vi.spyOn(window, 'getComputedStyle').mockImplementation(computed)
  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({ width: 500, height: 500 } as DOMRect)
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ width: 100, height: 100 } as DOMRect)
  return { el, parent }
}

describe('analyzeStickyElement', () => {
  it('passes a valid sticky element', () => expect(analyzeStickyElement(fixture().el).isSticky).toBe(true))
  it.each([
    ['missing position', { position: 'static' }, "position: sticky"],
    ['missing inset', { top: 'auto', bottom: 'auto', left: 'auto', right: 'auto' }, 'Missing inset'],
    ['inline', { display: 'inline' }, "display: inline"],
  ])('detects %s', (_, css, text) => expect(analyzeStickyElement(fixture(css).el).issues.join(' ')).toContain(text))
  it('detects overflow, transform, no space, and flex traps', () => {
    expect(analyzeStickyElement(fixture({}, { overflow: 'hidden' }).el).issues[0]).toContain('overflow')
    expect(analyzeStickyElement(fixture({}, { transform: 'translateZ(0)' }).el).issues[0]).toContain('containing block')
    const noSpace = fixture(); vi.spyOn(noSpace.parent, 'getBoundingClientRect').mockReturnValue({ width: 100, height: 50 } as DOMRect); vi.spyOn(noSpace.el, 'getBoundingClientRect').mockReturnValue({ width: 100, height: 100 } as DOMRect); expect(analyzeStickyElement(noSpace.el).issues.join(' ')).toContain('no vertical')
  })
  it('handles null and table cells', () => { expect(analyzeStickyElement(null).issues[0]).toContain('not found'); const { el } = fixture(); const th = document.createElement('th'); document.body.append(th); expect(analyzeStickyElement(th).isSticky).toBe(true); void el })
})
