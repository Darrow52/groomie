/* Header: hide on scroll down, reveal on scroll up, light theme over page content */

const THRESHOLD = 8

export function initHeader() {
  const header = document.querySelector('[data-header]')
  if (!header) return

  const hero = document.querySelector('main > section')
  const megaMenu = header.querySelector('#mega-menu')
  let lastY = window.scrollY
  let ticking = false

  const locked = () => header.hasAttribute('data-open') || !megaMenu.hidden || header.matches(':focus-within')

  function update() {
    ticking = false
    const y = window.scrollY
    const delta = y - lastY

    if (y <= header.offsetHeight || locked()) {
      header.removeAttribute('data-hidden')
      lastY = y
    } else if (Math.abs(delta) >= THRESHOLD) {
      header.toggleAttribute('data-hidden', delta > 0)
      lastY = y
    }

    header.toggleAttribute('data-light', hero.getBoundingClientRect().bottom <= header.offsetHeight)
  }

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    },
    { passive: true },
  )
  window.addEventListener('resize', update)
  header.addEventListener('focusin', () => header.removeAttribute('data-hidden'))

  update()
}
