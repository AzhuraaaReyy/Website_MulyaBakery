import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Menu from './components/Menu'
import WhyUs from './components/WhyUs'
import Testimonials from './components/Testimonials'
import Gallery from './components/Gallery'
import HowToOrder from './components/HowToOrder'
import LocationContact from './components/LocationContact'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import ScrollStoryBackground from './components/ScrollStoryBackground'

export default function App() {
  return (
    <>
      {/* Latar animasi scroll-driven di belakang semua section */}
      <ScrollStoryBackground />

      <Navbar />
      <main className="relative">
        <Hero />
        <About />
        <Menu />
        <WhyUs />
        <Testimonials />
        <Gallery />
        <HowToOrder />
        <LocationContact />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
