import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import App from './App'
import './styles.css'
import showroom from '../data/showroom.json'
import type { Showroom } from './car/contract'

const S = showroom as unknown as Showroom
if (matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.globalTimeline.timeScale(50)
if (S.name) {
  document.title = `${S.name}, private appointments`
  const o: Record<string, string> = { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: S.name }
  if (S.canonical) o.url = S.canonical
  if (S.contact.phone) o.telephone = S.contact.phone
  if (S.contact.email) o.email = S.contact.email
  if (S.contact.address) o.address = S.contact.address
  const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(o); document.head.append(s)
}
if (S.description) document.querySelector('meta[name=description]')?.setAttribute('content', S.description)
createRoot(document.getElementById('root')!).render(<App />)
