import './style.css'

import { initHeader } from './js/header.js'
import { initMenu } from './js/menu.js'
import { initCarousel } from './js/carousel.js'
import { initResults } from './js/results.js'
import { initScrollSlider, initVideoSlider } from './js/video-slider.js'
import { initCounters } from './js/counters.js'
import { initCountrySelect } from './js/country-select.js'
import { initNewsletter } from './js/newsletter.js'

initHeader()
initMenu()

document.querySelectorAll('[data-carousel]').forEach((root) => {
  const carousel = initCarousel(root)
  if (root.hasAttribute('data-results')) initResults(root, carousel)
  if (root.hasAttribute('data-video-slider')) initVideoSlider(root, carousel)
})

document.querySelectorAll('[data-video-slider]:not([data-carousel])').forEach((root) => {
  initVideoSlider(root, initScrollSlider(root))
})

initCounters()
initCountrySelect()
initNewsletter()
