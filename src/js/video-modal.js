/* Video modal */

export function initVideoModal() {
  const dialog = document.getElementById('video-modal')
  if (!dialog) return

  const video = dialog.querySelector('video')
  const poster = dialog.querySelector('[data-video-poster]')
  const fallback = dialog.querySelector('[data-video-fallback]')
  const title = dialog.querySelector('[data-video-title]')

  // Open
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-video]')
    if (!button) return

    const src = button.dataset.video
    const cover = button.parentElement.querySelector('img')

    title.textContent = button.getAttribute('aria-label') || 'Video'
    poster.src = cover?.src || ''
    video.poster = cover?.src || ''

    video.hidden = !src
    poster.hidden = Boolean(src)
    fallback.hidden = Boolean(src)

    dialog.showModal()

    if (src) {
      video.src = src
      video.play().catch(() => {})
    }
  })

  // Close
  dialog.querySelector('[data-video-close]').addEventListener('click', () => dialog.close())
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close()
  })

  // Stop video on close
  dialog.addEventListener('close', () => {
    video.pause()
    video.removeAttribute('src')
    video.load()
  })
}
