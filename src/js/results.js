/* Results: avatars switch the customer, arrows switch the growth stage */

// Image folder (respects Vite's base, so paths work on GitHub Pages)
const IMG = `${import.meta.env.BASE_URL}img/`
const PLACEHOLDER = `${IMG}result-placeholder.svg`

// Customers: one [before, after] pair per stage (1 month, 3 months, 6 months); null = placeholder
const CUSTOMERS = [
  {
    name: 'Emily K.',
    photos: [
      [`${IMG}result-1-before.webp`, `${IMG}result-1-after.webp`],
      [`${IMG}result-2-before.webp`, `${IMG}result-2-after.webp`],
      [`${IMG}result-3-before.webp`, `${IMG}result-3-after.webp`],
    ],
    quote:
      "“I can't believe this is my own hair. It feels so full and healthy again, I finally feel like myself. My skin feels smoother and more hydrated. I can't believe this is my own hair.”",
  },
  {
    name: 'Jessica M.',
    photos: [null, null, null],
    quote:
      '“My part line used to show through in every photo. Three months in, my ponytail feels twice as thick and I finally wear my hair down again.”',
  },
  {
    name: 'Sarah L.',
    photos: [null, null, null],
    quote:
      "“So much less hair in the shower drain after a couple of months. Two capsules a day is the easiest habit I've ever kept.”",
  },
  {
    name: 'Olivia R.',
    photos: [null, null, null],
    quote:
      '“Around month three I spotted tiny new hairs along my hairline. My stylist noticed the difference before I even told her.”',
  },
  {
    name: 'Megan T.',
    photos: [null, null, null],
    quote:
      '“My hair used to snap before it reached my shoulders. Now it feels stronger, grows longer and has its shine back.”',
  },
  {
    name: 'Anna P.',
    photos: [null, null, null],
    quote:
      '“I was skeptical, but the before and after photos speak for themselves. My hair looks fuller and feels softer every week.”',
  },
]

export function initResults(root, carousel) {
  const track = root.querySelector('[data-carousel-track]')
  const avatars = [...root.querySelectorAll('[data-customer]')]
  const startStage = Number(track.dataset.start) || 0

  // Photo
  function setPhoto(img, src, alt) {
    img.src = src || PLACEHOLDER
    img.alt = src ? alt : `${alt} (photo coming soon)`
  }

  // Customer
  function show(index) {
    const customer = CUSTOMERS[index]

    track.querySelectorAll('[data-stage]').forEach((slide) => {
      const stage = Number(slide.dataset.stage)
      const label = slide.querySelector('.badge-gold').textContent.trim().toLowerCase()

      const [before, after] = customer.photos[stage] || []

      setPhoto(slide.querySelector('[data-photo="before"]'), before, `${customer.name} before EverBlume`)
      setPhoto(slide.querySelector('[data-photo="after"]'), after, `${customer.name}, ${label}`)
      slide.querySelector('[data-name]').textContent = `- ${customer.name}`
      slide.querySelector('[data-quote]').textContent = customer.quote
    })

    avatars.forEach((avatar, i) => avatar.setAttribute('aria-current', String(i === index)))
    avatars[index].scrollIntoView({ block: 'nearest', inline: 'nearest' })

    carousel.goTo(startStage, { instant: true })
    track.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' })
  }

  // Avatars
  avatars.forEach((avatar) =>
    avatar.addEventListener('click', () => {
      const index = Number(avatar.dataset.customer)
      if (avatar.getAttribute('aria-current') !== 'true') show(index)
    }),
  )
}
