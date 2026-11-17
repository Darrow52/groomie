/* Header: mobile menu (full screen) and desktop mega menu */

export function initMenu() {
  const header = document.querySelector('[data-header]')
  if (!header) return

  const burger = header.querySelector('[data-menu-toggle]')
  const mobileMenu = header.querySelector('#mobile-menu')
  const shopButton = header.querySelector('[data-shop-toggle]')
  const megaMenu = header.querySelector('#mega-menu')

  // Mobile menu
  function setMobile(open) {
    mobileMenu.hidden = !open
    header.toggleAttribute('data-open', open)
    burger.setAttribute('aria-expanded', String(open))
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
  }

  // Mega menu
  function setMega(open) {
    megaMenu.hidden = !open
    shopButton.setAttribute('aria-expanded', String(open))
  }

  function closeAll() {
    setMobile(false)
    setMega(false)
  }

  // Toggles
  burger.addEventListener('click', () => setMobile(mobileMenu.hidden))
  shopButton.addEventListener('click', () => setMega(megaMenu.hidden))

  // Link click
  header.addEventListener('click', (event) => {
    if (event.target.closest('#mobile-menu a, #mega-menu a')) closeAll()
  })

  // Outside click
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setMega(false)
  })

  // Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (!megaMenu.hidden) {
      setMega(false)
      shopButton.focus()
    } else if (!mobileMenu.hidden) {
      setMobile(false)
      burger.focus()
    }
  })

  // Breakpoint change
  window.matchMedia('(min-width: 1024px)').addEventListener('change', closeAll)
}
