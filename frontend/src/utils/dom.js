// Small framework-independent DOM helpers used by the responsive sidebar and modal.
export function setPageScrollLocked(locked) {
  document.documentElement.classList.toggle('scroll-locked', locked)
}

export function focusFirstInteractive(container) {
  const element = container?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  element?.focus()
}
