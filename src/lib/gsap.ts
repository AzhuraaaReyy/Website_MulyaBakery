import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Registrasi plugin GSAP secara terpusat (cukup sekali di seluruh app).
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
