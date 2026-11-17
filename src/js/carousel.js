/* Carousel: active slide in the center, neighbours on both sides */

// Enough slides for both sides of a wide (2560px+) screen
const MIN_SLIDES = 9

export function initCarousel(root) {
  const track = root.querySelector('[data-carousel-track]')
  const dots = [...root.querySelectorAll('[data-carousel-dot]')]
  let slides = [...track.children]
  const realCount = slides.length

  // Clone slides
  while (slides.length < MIN_SLIDES) {
    slides.slice(0, realCount).forEach((slide) => {
      const copy = slide.cloneNode(true)
      copy.setAttribute('aria-hidden', 'true')
      track.append(copy)
    })
    slides = [...track.children]
  }

  // Avatar index of a slide (data-dot, or slide order)
  const dotOf = (index) => (slides[index].dataset.dot !== undefined ? Number(slides[index].dataset.dot) : index % realCount)

  const count = slides.length
  let active = Number(track.dataset.start) || 0

  // Slide offset from the center
  function offsetOf(index) {
    let d = index - active
    if (d > count / 2) d -= count
    if (d <= -count / 2) d += count
    return d
  }

  // Layout
  function render(step = 0, instant = false) {
    const styles = getComputedStyle(track)
    const gap = parseFloat(styles.columnGap) || 0
    const scale = parseFloat(styles.getPropertyValue('--side-scale')) || 1
    const width = slides[0].offsetWidth
    const sideWidth = width * scale

    const transformOf = (d) => {
      const x = d === 0 ? 0 : Math.sign(d) * (width / 2 + gap + sideWidth / 2 + (Math.abs(d) - 1) * (sideWidth + gap))
      return `translateX(${x}px) scale(${d === 0 ? 1 : scale})`
    }

    slides.forEach((slide, index) => {
      const d = offsetOf(index)
      const prev = slide.dataset.offset === undefined ? d : Number(slide.dataset.offset)
      const wrapped = step !== 0 && d - prev !== -step

      if (instant) {
        slide.style.transition = 'none'
      } else if (wrapped) {
        // Slide moved to the other end: start it off-screen, then slide it in
        slide.style.transition = 'none'
        slide.style.transform = transformOf(d + step)
        slide.offsetWidth
        slide.style.transition = ''
      } else {
        slide.style.transition = ''
      }

      slide.style.transform = transformOf(d)
      slide.dataset.offset = d
      slide.toggleAttribute('data-active', d === 0)

      slide.querySelectorAll('a, button').forEach((el) => (el.tabIndex = d === 0 ? 0 : -1))
    })

    dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === dotOf(active))))
  }

  // Navigation
  function goTo(index, { instant = false } = {}) {
    const target = ((index % count) + count) % count
    if (instant) {
      active = target
      render(0, true)
      return
    }
    if (target === active) return
    let step = target - active
    if (step > count / 2) step -= count
    if (step < -count / 2) step += count
    active = target
    render(step)
  }

  // Arrows
  root.querySelector('[data-carousel-prev]')?.addEventListener('click', () => goTo(active - 1))
  root.querySelector('[data-carousel-next]')?.addEventListener('click', () => goTo(active + 1))

  // Avatars
  dots.forEach((dot, index) =>
    dot.addEventListener('click', () => {
      const candidates = slides.map((_, i) => i).filter((i) => dotOf(i) === index)
      const nearest = candidates.sort((a, b) => Math.abs(offsetOf(a)) - Math.abs(offsetOf(b)))[0]
      goTo(nearest)
    }),
  )

  // Swipe
  let startX = null
  let swiped = false
  track.addEventListener('pointerdown', (event) => {
    startX = event.clientX
    swiped = false
  })
  track.addEventListener('pointerup', (event) => {
    if (startX === null) return
    const dx = event.clientX - startX
    startX = null
    if (Math.abs(dx) > 40) {
      swiped = true
      goTo(active + (dx < 0 ? 1 : -1))
    }
  })

  // Side slide click
  track.addEventListener(
    'click',
    (event) => {
      const slide = event.target.closest('[data-offset]')
      if (!slide) return
      if (swiped || !slide.hasAttribute('data-active')) {
        event.preventDefault()
        event.stopPropagation()
        if (!swiped) goTo(slides.indexOf(slide))
      }
      swiped = false
    },
    true,
  )

  // Keyboard
  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') goTo(active + 1)
    if (event.key === 'ArrowLeft') goTo(active - 1)
  })

  // Resize
  window.addEventListener('resize', () => render(0, true))

  render(0, true)

  return { goTo }
}
