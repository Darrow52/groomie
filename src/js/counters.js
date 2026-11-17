/* Clinical proof: count up from zero once when visible */

const DURATION = 1600

export function initCounters() {
  const counters = [...document.querySelectorAll('[data-counter]')]
  if (!counters.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const format = (el, value) => {
    const decimals = Number(el.dataset.decimals || 0)
    el.textContent = `${el.dataset.prefix || ''}${value.toFixed(decimals)}${el.dataset.suffix || ''}`
  }

  function animate(el) {
    const target = Number(el.dataset.counter)
    const start = performance.now()
    const step = (now) => {
      const t = Math.min((now - start) / DURATION, 1)
      format(el, target * (1 - (1 - t) ** 3))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        observer.unobserve(entry.target)
        animate(entry.target)
      })
    },
    { threshold: 0.6 },
  )

  counters.forEach((el) => {
    format(el, 0)
    observer.observe(el)
  })
}
