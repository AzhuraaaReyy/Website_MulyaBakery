import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Package,
  Truck,
  CreditCard,
  Cake,
  Leaf,
  Clock,
  MessageSquareText,
} from "lucide-react";
import { faqs } from "../data/faq";
import { useScrolly } from "../hooks/useScrolly";

const getFaqIcon = (index: number) => {
  const icons = [Package, Truck, CreditCard, Cake, Leaf, Clock];
  const IconComponent = icons[index % icons.length];
  return <IconComponent className="h-5 w-5" />;
};

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrolly(sectionRef);

  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-paper-100 text-cocoa-800 flex flex-col justify-between overflow-x-hidden">
      {/* Import Google Font khusus untuk konten jawaban */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        .faq-custom-content {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
        .section-3-container p,
        .font-section3-p {
          font-family: 'Itim', cursive, sans-serif;
        }
      `}</style>

      {/* FAQ MAIN SECTION */}
      <section
        id="faq"
        ref={sectionRef}
        className="relative flex-grow overflow-hidden bg-paper-50 pb-24 pt-12 sm:pt-16 lg:pb-32 lg:pt-24 min-h-[100dvh] flex flex-col justify-center"
      >
        <div
          className="paper-grain pointer-events-none absolute inset-0 opacity-50"
          aria-hidden
        />

        {/* Ilustrasi Dekoratif Samping (Khusus Desktop - Sesuai Asli) */}
        <div className="absolute left-0 top-24 hidden xl:block opacity-65 pointer-events-none w-48 sm:w-60 lg:w-72 xl:w-80">
          <img
            src="/images/rotisketsa.png"
            alt="Ilustrasi Keranjang Roti"
            className="w-full h-auto object-contain"
          />
        </div>
        <div className="absolute right-0 top-24 hidden xl:block opacity-65 pointer-events-none w-48 sm:w-60 lg:w-72 xl:w-80">
          <img
            src="/images/tokosketsa.png"
            alt="Toko Roti Mulyaa"
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="container-wide relative z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full">
          {/* Header Judul dengan Ilustrasi Mobile di atas/samping judul */}
          <div className="mx-auto max-w-2xl text-center relative">
            {/* Ilustrasi Kiri (Mobile) */}
            <div className="absolute -left-2 sm:-left-8 -top-7 sm:-top-6 w-20 sm:w-28 opacity-65 pointer-events-none xl:hidden">
              <img
                src="/images/rotisketsa.png"
                alt="Ilustrasi Keranjang Roti"
                className="w-full h-auto object-contain"
              />
            </div>
            {/* Ilustrasi Kanan (Mobile) */}
            <div className="absolute -right-2 sm:-right-8 -top-6 sm:-top-6 w-20 sm:w-28 opacity-65 pointer-events-none xl:hidden">
              <img
                src="/images/tokosketsa.png"
                alt="Toko Roti Mulyaa"
                className="w-full h-auto object-contain"
              />
            </div>

            <span
              data-reveal
              className="eyebrow-script text-pink-500 sm:text-caramel tracking-widest uppercase text-lg sm:text-xl font-bold"
            >
              FAQ
            </span>
            <h2
              data-reveal
              className="title-1 mt-2 text-3xl sm:text-4xl lg:text-5xl font-heading"
            >
              Pertanyaan yang{" "}
              <span className="text-pink-500 sm:text-caramel">
                sering ditanya
              </span>
            </h2>
            <p className="mt-3 text-cocoa-700/80 text-sm sm:text-base text-justify sm:text-center">
              Temukan jawaban untuk pertanyaan yang paling sering ditanyakan
              oleh pelanggan kami.
            </p>
          </div>

          {/* List Accordion FAQ */}
          <div data-stagger className="mx-auto mt-10 sm:mt-16 space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div key={faq.question}>
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{
                      y: -4,
                      scale: 1.005,
                      transition: { duration: 0.2 },
                    }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={`overflow-hidden rounded-[1.4rem] bg-white shadow-lift ring-1 transition-all duration-300 ${
                      isOpen
                        ? "ring-pink-400 sm:ring-caramel/50 shadow-md border border-pink-200 sm:border-transparent"
                        : "ring-cocoa-700/10 hover:ring-cocoa-700/30"
                    }`}
                  >
                    <h3>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 sm:gap-4">
                          {/* Ikon Kiri */}
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                              isOpen
                                ? "bg-pink-500 sm:bg-caramel text-white shadow-sm"
                                : "bg-pink-50 sm:bg-paper-100 text-pink-500 shadow-sm"
                            }`}
                          >
                            {getFaqIcon(i)}
                          </span>
                          <span className="font-heading text-base sm:text-lg text-cocoa-800 transition-colors">
                            {faq.question}
                          </span>
                        </div>
                        {/* Tombol Aksi Kanan (Minus/Plus) */}
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                            isOpen
                              ? "bg-pink-500 sm:bg-caramel text-white shadow-sm"
                              : "bg-pink-50 sm:bg-paper-100 text-pink-500 shadow-sm"
                          }`}
                        >
                          <Plus
                            className={`h-5 w-5 transition-transform ${
                              isOpen ? "rotate-45" : ""
                            }`}
                            aria-hidden
                          />
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
                          {/* Konten jawaban dengan teks rata kanan-kiri (text-justify) dan stabil */}
                          <div className="faq-custom-content border-t border-cocoa-700/10 mx-6 mt-1 px-2 sm:px-6 pb-6 pt-1 text-sm leading-relaxed text-cocoa-700/90 sm:text-base">
                            <p className="font-section3-p pt-3 text-justify">
                              {faq.answer.includes("Rp100.000") ? (
                                <>
                                  {faq.answer.split("Rp100.000")[0]}
                                  <span className="text-pink-500 font-medium">
                                    Rp100.000
                                  </span>
                                  {faq.answer.split("Rp100.000")[1]}
                                </>
                              ) : (
                                faq.answer
                              )}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Bottom Banner Card ("Masih punya pertanyaan?") */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-14 sm:mt-16 bg-white border border-pink-300 sm:border-caramel/50 rounded-[1.8rem] p-5 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full sm:w-auto">
              <div className="flex h-16 w-16 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-pink-200 text-pink-500 shadow-sm overflow-hidden p-2">
                <img
                  src="/images/icontoko.png"
                  alt="Ikon Pertanyaan"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div>
                <h4 className="font-heading text-lg sm:text-xl text-cocoa-800">
                  Masih punya pertanyaan?
                </h4>
                <p className="faq-custom-content text-sm text-cocoa-700/80 mt-1 text-center sm:text-left">
                  Tim kami siap membantu menjawab pertanyaan Anda kapan saja.
                </p>
              </div>
            </div>
            <a
              href="#kontak"
              className="bg-pink-500 sm:bg-caramel text-white px-6 py-3 rounded-full text-sm font-semibold shadow-md hover:bg-pink-600 sm:hover:bg-caramel/90 transition-all flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 cursor-pointer"
            >
              <MessageSquareText className="h-4 w-4" />
              <span>Hubungi Kami</span>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
