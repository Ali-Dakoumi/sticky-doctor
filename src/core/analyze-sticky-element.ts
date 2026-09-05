export type StickyDiagnosis = {
  isSticky: boolean
  issues: string[]
}

export function analyzeStickyElement(element: HTMLElement | null): StickyDiagnosis {
  if (!element) return { isSticky: false, issues: ['Element not found in the DOM.'] }
  const issues: string[] = []
  const styles = window.getComputedStyle(element)
  if (styles.position !== 'sticky') issues.push(`Element is missing 'position: sticky'. Current position is '${styles.position}'.`)
  if (styles.display === 'inline') issues.push(`Element has 'display: inline'. Sticky positioning requires block, inline-block, flex, or grid.`)
  const hasInset = ['top', 'bottom', 'left', 'right'].some((dir) => styles.getPropertyValue(dir) !== 'auto')
  if (!hasInset) issues.push('Missing inset property. You must define top, bottom, left, or right (e.g., top: 0px).')
  let parent = element.parentElement
  while (parent) {
    const parentStyles = window.getComputedStyle(parent)
    if ([parentStyles.overflow, parentStyles.overflowY, parentStyles.overflowX].some((v) => v === 'hidden' || v === 'clip')) {
      const className = parent.className ? `.${String(parent.className).split(' ').join('.')}` : ''
      issues.push(`Ancestor <${parent.tagName.toLowerCase()}${className}> has overflow: hidden|clip. This usually breaks sticky positioning.`)
      break
    }
    if (parentStyles.transform !== 'none' || parentStyles.perspective !== 'none' || parentStyles.filter !== 'none') {
      issues.push(`Ancestor <${parent.tagName.toLowerCase()}> creates a containing block (transform/filter/perspective), breaking viewport-relative sticky behavior.`)
      break
    }
    parent = parent.parentElement
  }
  const directParent = element.parentElement
  if (directParent) {
    const parentStyles = window.getComputedStyle(directParent)
    const parentRect = directParent.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const height = parentRect.height - (parseFloat(parentStyles.paddingTop) || 0) - (parseFloat(parentStyles.paddingBottom) || 0)
    const width = parentRect.width - (parseFloat(parentStyles.paddingLeft) || 0) - (parseFloat(parentStyles.paddingRight) || 0)
    const table = ['th', 'td', 'tr', 'thead'].includes(element.tagName.toLowerCase())
    if (!table && styles.display !== 'inline') {
      if (Math.round(height) <= Math.round(elementRect.height) && styles.top !== 'auto') issues.push(`Parent container has no vertical scroll space. Available space (~${Math.round(height)}px) <= Element height (~${Math.round(elementRect.height)}px).`)
      if (Math.round(width) <= Math.round(elementRect.width) && styles.left !== 'auto') issues.push(`Parent container has no horizontal scroll space. Available space (~${Math.round(width)}px) <= Element width (~${Math.round(elementRect.width)}px).`)
    }
    if (parentStyles.display.includes('flex') || parentStyles.display.includes('grid')) {
      const stretch = (styles.alignSelf === 'auto' || styles.alignSelf === 'stretch' || styles.alignSelf === 'normal') && (parentStyles.alignItems === 'normal' || parentStyles.alignItems === 'stretch')
      if (stretch && parentStyles.flexDirection.includes('row') && (styles.top !== 'auto' || styles.bottom !== 'auto')) issues.push(`Element is stretching vertically to fill its Flex/Grid row, leaving no vertical room to scroll. Add 'align-self: flex-start'.`)
      if (stretch && parentStyles.flexDirection.includes('column') && (styles.left !== 'auto' || styles.right !== 'auto')) issues.push(`Element is stretching horizontally to fill its Flex/Grid column, leaving no horizontal room to scroll. Add 'align-self: flex-start'.`)
    }
  }
  return { isSticky: issues.length === 0, issues }
}

export type { StickyDiagnosis as StickyDiagnosisResult }
export default analyzeStickyElement

// The implementation intentionally reads browser APIs only when called, so the core remains tree-shakeable and SSR-safe.
/* v8 ignore next */
void 0
