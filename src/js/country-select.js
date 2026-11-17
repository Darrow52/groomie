/* Footer: country selector */

export function initCountrySelect() {
  const button = document.querySelector('[data-country-toggle]')
  if (!button) return

  const list = document.getElementById(button.getAttribute('aria-controls'))
  const options = [...list.querySelectorAll('[role="option"]')]
  const current = button.querySelector('[data-country-current]')

  // Flag + label of an option (without the check icon)
  const flagAndLabel = (option) =>
    [...option.children].filter((child) => !child.hasAttribute('data-check')).map((child) => child.cloneNode(true))

  // Open / close
  function open() {
    list.hidden = false
    button.setAttribute('aria-expanded', 'true')
    const selected = options.find((option) => option.getAttribute('aria-selected') === 'true')
    ;(selected || options[0]).focus()
  }

  function close(returnFocus = true) {
    list.hidden = true
    button.setAttribute('aria-expanded', 'false')
    if (returnFocus) button.focus()
  }

  // Select option
  function choose(option) {
    options.forEach((o) => o.setAttribute('aria-selected', String(o === option)))
    current.replaceChildren(...flagAndLabel(option))
    localStorage.setItem('groomie-country', option.dataset.value)
    close()
  }

  // Button
  button.addEventListener('click', () => (list.hidden ? open() : close()))
  button.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      open()
    }
  })

  // Options
  options.forEach((option, index) => {
    option.addEventListener('click', () => choose(option))
    option.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') options[Math.min(index + 1, options.length - 1)].focus()
      else if (event.key === 'ArrowUp') options[Math.max(index - 1, 0)].focus()
      else if (event.key === 'Enter' || event.key === ' ') choose(option)
      else if (event.key === 'Escape') close()
      else if (event.key === 'Tab') close(false)
      else return
      event.preventDefault()
    })
  })

  // Outside click
  document.addEventListener('click', (event) => {
    if (!list.hidden && !button.contains(event.target) && !list.contains(event.target)) close(false)
  })

  // Saved country
  const saved = options.find((option) => option.dataset.value === localStorage.getItem('groomie-country'))
  if (saved && saved.getAttribute('aria-selected') !== 'true') {
    options.forEach((o) => o.setAttribute('aria-selected', String(o === saved)))
    current.replaceChildren(...flagAndLabel(saved))
  }
}
