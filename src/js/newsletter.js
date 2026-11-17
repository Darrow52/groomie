/* Footer: newsletter form states (default, error, success) */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function initNewsletter() {
  const form = document.querySelector('[data-newsletter]')
  if (!form) return

  const input = form.querySelector('input[type="email"]')

  // State (data-state drives the Tailwind group-data-[state=…] classes)
  function setState(state) {
    if (state) form.dataset.state = state
    else delete form.dataset.state
    input.setAttribute('aria-invalid', String(state === 'error'))
  }

  // Submit
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    setState(EMAIL.test(input.value.trim()) ? 'success' : 'error')
  })

  // Typing resets the message
  input.addEventListener('input', () => setState(null))
}
