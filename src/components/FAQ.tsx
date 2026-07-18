import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { faqs } from "../data/faq";
import { useScrolly } from "../hooks/useScrolly";
import TornPaper from "./TornPaper";
import Decor from "./Decor";

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrolly(sectionRef);

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="relative overflow-hidden bg-paper-100 pb-44 pt-24 lg:pb-52 lg:pt-32"
    >
      <div className="paper-grain pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      {/* Aksen bahan cut-out */}
      <Decor src="/images/decor/beri.png" parallax={0.22} rotate={-16}
        className="-right-8 top-24 hidden w-24 lg:block lg:w-32" />
      <Decor src="/images/decor/gandum.png" parallax={-0.2} rotate={24}
        className="-left-10 bottom-48 hidden w-28 lg:block lg:w-36" />

      <div className="container-wide relative">
        <div className="mx-auto max-w-2xl text-center">
          <span data-reveal className="eyebrow-script">
            FAQ
          </span>
          <h2 data-reveal className="title-1 mt-2">
            Pertanyaan yang sering ditanya
          </h2>
        </div>

        <div data-stagger className="mx-auto mt-16 max-w-3xl space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question}>
                <div
                  className={`overflow-hidden rounded-[1.4rem] bg-paper-50 shadow-lift ring-1 transition-shadow ${
                    isOpen ? "ring-caramel/40" : "ring-cocoa-700/10"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="font-heading text-lg text-cocoa-800">
                        {faq.question}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                          isOpen
                            ? "bg-cocoa-800 text-paper-50"
                            : "bg-caramel/15 text-caramel ring-1 ring-caramel/25"
                        }`}
                      >
                        <Plus className="h-5 w-5" aria-hidden />
                      </motion.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <p className="px-6 pb-6 font-text leading-relaxed text-cocoa-700/85">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sobekan ke Footer (cokelat pekat) */}
      <TornPaper fill="#412415" core="#5C3520" seed="faq-tear" height={84} />
    </section>
  );
}
