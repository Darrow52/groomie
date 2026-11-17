import './style.css'

import { initMenu } from './js/menu.js'
import { initCarousel } from './js/carousel.js'
import { initResults } from './js/results.js'
import { initVideoModal } from './js/video-modal.js'
import { initCountrySelect } from './js/country-select.js'
import { initNewsletter } from './js/newsletter.js'

initMenu()

document.querySelectorAll('[data-carousel]').forEach((root) => {
  const carousel = initCarousel(root)
  if (root.hasAttribute('data-results')) initResults(root, carousel)
})

initVideoModal()
initCountrySelect()
initNewsletter()
