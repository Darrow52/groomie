/* Carousel: active slide in the center, neighbours on both sides */

const MIN_SLIDES = 9

export function initCarousel(root) {
  const track = root.querySelector('[data-carousel-track]')
  const dots = [...root.querySelectorAll('[data-carousel-dot]')]
  let slides = [...track.children]
  const realCount = slides.length
  const listeners = []

  while (slides.length < MIN_SLIDES) {
    slides.slice(0, realCount).forEach((slide) => {
      const copy = slide.cloneNode(true)
      copy.setAttribute('aria-hidden', 'true')
      track.append(copy)
    })
    slides = [...track.children]
  }

  const count = slides.length
  let active = Number(track.dataset.start) || 0

  const dotOf = (index) => (slides[index].dataset.dot !== undefined ? Number(slides[index].dataset.dot) : index % realCount)

  function offsetOf(index) {
    let d = index - active
    if (d > count / 2) d -= count
    if (d <= -count / 2) d += count
    return d
  }

  function setInstant(on) {
    slides.forEach((slide) => slide.toggleAttribute('data-instant', on))
  }

  function render(step = 0, instant = false) {
    if (instant) setInstant(true)

    slides.forEach((slide, index) => {
      const d = offsetOf(index)
      const prev = slide.dataset.offset === undefined ? d : Number(slide.dataset.offset)

      if (!instant && step !== 0 && d - prev !== -step) {
        slide.setAttribute('data-instant', '')
        slide.dataset.offset = d + step
        slide.offsetWidth
        slide.removeAttribute('data-instant')
      }

      slide.dataset.offset = d
      slide.toggleAttribute('data-active', d === 0)
      slide.querySelectorAll('a, button').forEach((el) => (el.tabIndex = d === 0 ? 0 : -1))
    })

    dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === dotOf(active))))

    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => setInstant(false)))
  }

  function goTo(index, { instant = false, manual = true } = {}) {
    const target = ((index % count) + count) % count
    if (instant) {
      active = target
      render(0, true)
      listeners.forEach((cb) => cb(slides[active], manual))
      return
    }
    if (target === active) return
    let step = target - active
    if (step > count / 2) step -= count
    if (step < -count / 2) step += count
    active = target
    render(step)
    listeners.forEach((cb) => cb(slides[active], manual))
  }

  root.querySelector('[data-carousel-prev]')?.addEventListener('click', () => goTo(active - 1))
  root.querySelector('[data-carousel-next]')?.addEventListener('click', () => goTo(active + 1))

  dots.forEach((dot, index) =>
    dot.addEventListener('click', () => {
      const candidates = slides.map((_, i) => i).filter((i) => dotOf(i) === index)
      const nearest = candidates.sort((a, b) => Math.abs(offsetOf(a)) - Math.abs(offsetOf(b)))[0]
      goTo(nearest)
    }),
  )

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

  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') goTo(active + 1)
    if (event.key === 'ArrowLeft') goTo(active - 1)
  })

  render(0, true)

  return {
    goTo,
    next: () => goTo(active + 1, { manual: false }),
    select: (slide) => goTo(slides.indexOf(slide)),
    active: () => slides[active],
    onChange: (cb) => listeners.push(cb),
  }
}
