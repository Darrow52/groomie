/* Video sliders: 4-second muted previews, manual playback with sound */

const PREVIEW_MS = 4000
const VIDEO_DIR = `${import.meta.env.BASE_URL}video/`
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

export function initScrollSlider(root) {
  const track = root.querySelector('[data-scroll-track]')
  const slides = [...track.children]
  const listeners = []
  let active = 0
  let programmatic = false
  let settleTimer = null

  const scrollable = () => track.scrollWidth > track.clientWidth + 1
  const positionOf = (slide) => slide.offsetLeft - slides[0].offsetLeft

  function set(index, manual) {
    active = (index + slides.length) % slides.length
    slides.forEach((slide, i) => slide.toggleAttribute('data-active', i === active))
    listeners.forEach((cb) => cb(slides[active], manual))
  }

  function reveal() {
    if (!scrollable()) return
    programmatic = true
    track.scrollTo({ left: positionOf(slides[active]), behavior: reducedMotion.matches ? 'auto' : 'smooth' })
  }

  function settle() {
    if (programmatic) {
      programmatic = false
      return
    }
    if (!scrollable()) return
    const nearest = slides.reduce(
      (best, slide, i) => (Math.abs(positionOf(slide) - track.scrollLeft) < Math.abs(positionOf(slides[best]) - track.scrollLeft) ? i : best),
      0,
    )
    if (nearest !== active) set(nearest, true)
  }

  track.addEventListener('scroll', () => {
    clearTimeout(settleTimer)
    settleTimer = setTimeout(settle, 150)
  })

  slides.forEach((slide) => slide.toggleAttribute('data-active', slide === slides[0]))

  return {
    next: () => {
      set(active + 1, false)
      reveal()
    },
    select: (slide) => {
      set(slides.indexOf(slide), true)
      reveal()
    },
    active: () => slides[active],
    onChange: (cb) => listeners.push(cb),
  }
}

export function initVideoSlider(root, slider) {
  const rotationToggle = root.querySelector('[data-rotation-toggle]')
  let current = slider.active()
  let mode = 'preview'
  let timer = null
  let inView = false
  let rotationPaused = false
  let hovering = false
  let focused = false

  const videoOf = (slide) => slide.querySelector('video')

  function setState(slide, state) {
    const button = slide.querySelector('[data-video-play]')
    button.dataset.label ??= button.getAttribute('aria-label')
    if (state) slide.dataset.state = state
    else slide.removeAttribute('data-state')
    button.setAttribute('aria-label', state === 'playing' ? button.dataset.label.replace(/^Play/, 'Pause') : button.dataset.label)
  }
  const running = () => inView && !document.hidden

  function load(video) {
    if (video.getAttribute('src') || !video.dataset.video || video.hasAttribute('data-missing')) return
    video.addEventListener(
      'error',
      () => {
        video.setAttribute('data-missing', '')
        video.removeAttribute('src')
        video.load()
      },
      { once: true },
    )
    video.src = VIDEO_DIR + video.dataset.video
  }

  function play(video) {
    return video.play().catch(() => {
      if (mode === 'sound') {
        mode = 'preview'
        setState(current, null)
      }
    })
  }

  function stop(slide) {
    const video = videoOf(slide)
    video.pause()
    video.muted = true
    setState(slide, null)
  }

  function schedule() {
    clearTimeout(timer)
    timer = null
    if (mode !== 'preview' || !running() || rotationPaused || hovering || focused || reducedMotion.matches) return
    timer = setTimeout(() => slider.next(), PREVIEW_MS)
  }

  function preview() {
    const video = videoOf(current)
    mode = 'preview'
    setState(current, null)
    video.muted = true
    video.loop = true
    if (reducedMotion.matches || !running()) {
      video.pause()
      return
    }
    load(video)
    video.currentTime = 0
    play(video)
  }

  function activate(slide) {
    if (slide !== current) stop(current)
    current = slide
    preview()
    schedule()
  }

  function playWithSound() {
    const video = videoOf(current)
    clearTimeout(timer)
    mode = 'sound'
    setState(current, 'playing')
    load(video)
    video.loop = false
    video.muted = false
    video.currentTime = 0
    play(video)
  }

  function pauseSound() {
    videoOf(current).pause()
    mode = 'paused'
    setState(current, 'paused')
  }

  slider.onChange((slide) => activate(slide))

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-video-play]')
    if (!button) return
    const slide = button.closest('li')
    if (slide !== current) slider.select(slide)
    if (current.dataset.state === 'playing') pauseSound()
    else playWithSound()
  })

  root.addEventListener(
    'ended',
    (event) => {
      if (event.target === videoOf(current) && mode === 'sound') {
        preview()
        schedule()
      }
    },
    true,
  )

  rotationToggle?.addEventListener('click', () => {
    rotationPaused = !rotationPaused
    rotationToggle.setAttribute('aria-pressed', String(rotationPaused))
    schedule()
  })

  root.addEventListener('pointerenter', () => {
    hovering = true
    schedule()
  })
  root.addEventListener('pointerleave', () => {
    hovering = false
    schedule()
  })
  root.addEventListener('focusin', (event) => {
    focused = event.target.matches(':focus-visible')
    schedule()
  })
  root.addEventListener('focusout', (event) => {
    if (root.contains(event.relatedTarget)) return
    focused = false
    schedule()
  })

  function resume() {
    if (!running()) {
      clearTimeout(timer)
      videoOf(current).pause()
      return
    }
    if (mode === 'sound') play(videoOf(current))
    else if (mode === 'preview') preview()
    schedule()
  }

  new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting
      resume()
    },
    { threshold: 0.4 },
  ).observe(root)

  document.addEventListener('visibilitychange', resume)
  reducedMotion.addEventListener('change', resume)
}
