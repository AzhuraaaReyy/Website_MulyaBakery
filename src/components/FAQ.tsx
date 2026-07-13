import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { faqs } from '../data/faq'
import { useScrolly } from '../hooks/useScrolly'

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrolly(sectionRef)

  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" ref={sectionRef} className="bg-transparent py-20 lg:py-28">
      <div className="container-warm">
        <div className="mx-auto max-w-2xl text-center">
          <span data-reveal className="eyebrow mb-4">
            FAQ
          </span>
          <h2 data-reveal className="text-display-md">
            Pertanyaan yang sering ditanya
          </h2>
        </div>

        <div data-stagger className="mx-auto mt-12 max-w-3xl space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div key={faq.question} className="overflow-hidden rounded-2xl bg-cream-dark shadow-warm">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-display text-lg text-brown-dark">{faq.question}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-terracotta"
                    >
                      <Plus className="h-5 w-5" aria-hidden />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <p className="px-6 pb-5 text-brown-deep/80">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
