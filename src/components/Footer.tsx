import { useState, useRef, useEffect } from "react";
import {
  Instagram,
  Facebook,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  ChevronDown,
} from "lucide-react";
import { BRAND, CONTACT, LOCATION } from "../config/contact";
import { generalOrderUrl } from "../lib/whatsapp";
import { useScrolly } from "../hooks/useScrolly";
import gsap from "gsap";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useScrolly(footerRef);
  const year = new Date().getFullYear();

  // State untuk accordion mobile (Menu, Produk, Hubungi Kami)
  const [openMenu, setOpenMenu] = useState(false);
  const [openProduct, setOpenProduct] = useState(false);
  const [openContact, setOpenContact] = useState(false);

  // GSAP Animation Integration
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    gsap.fromTo(
      el.children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      },
    );
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative bg-[#FAF5EE] text-[#4A3B32] pt-12 pb-6 overflow-hidden font-sans"
    >
      {/* ----------------------------------------------------------------------- */}
      {/* OVERLAY DEKORASI SKETSA TOKO & ROTI (DESKTOP & MOBILE)                  */}
      {/* ----------------------------------------------------------------------- */}
      <img
        src="/images/tokosketsa.png"
        alt="Sketsa Toko Background"
        className="absolute right-0 bottom-0 z-0 pointer-events-none object-contain 
          w-[380px] sm:w-[420px] lg:w-[480px] h-auto 
          opacity-30 translate-x-12 translate-y-6 transition-all duration-300 hidden lg:block"
      />
      <img
        src="/images/tokosketsa.png"
        alt="Sketsa Toko Background"
        className="absolute left-0 bottom-0 z-0 pointer-events-none object-contain 
          w-[380px] sm:w-[420px] lg:w-[480px] h-auto 
          opacity-20 sm:opacity-25 -translate-x-12 translate-y-6 -scale-x-100 transition-all duration-300 hidden lg:block"
      />
      <img
        src="/images/rotisketsa.png"
        alt="Sketsa Roti"
        className="absolute z-2 object-contain opacity-40 transition-all duration-300
          bottom-2 -left-6 w-[50%] sm:w-[45%] max-w-[220px] h-auto hidden lg:block"
      />
      <img
        src="/images/tokosketsa.png"
        alt="Sketsa Toko/Daun Background"
        className="absolute right-[-20px] bottom-0 z-0 pointer-events-none object-contain 
          w-[300px] sm:w-[320px] h-auto opacity-30 transition-all duration-300 block lg:hidden"
      />
      <div
        ref={contentRef}
        className="container-wide mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl relative z-10 flex flex-col justify-center"
      >
        {/* ========================================================================= */}
        {/* DESKTOP VIEW (GRID 12 KOLOM - TETAP UTUH TIDAK BERUBAH)                   */}
        {/* ========================================================================= */}
        <div className="hidden lg:grid grid-cols-12 gap-6 items-start pb-10 border-b border-[#E8DCD1]">
          {/* KOLOM 1: BRAND & DESKRIPSI */}
          <div className="lg:col-span-4 relative flex flex-col justify-between min-h-[320px] p-2 overflow-hidden w-full rounded-2xl">
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src="/images/Logo3.png"
                alt={BRAND.name || "Mulya Bakery"}
                className="absolute z-0 object-contain opacity-90 transition-all duration-300 -top-6 left-1/2 -translate-x-1/2 -ml-[10px] w-[210px] h-auto"
              />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full gap-6 pointer-events-auto pt-28 mt-4">
              <p className="text-sm leading-relaxed text-[#4A3B32] font-medium text-justify max-w-xs drop-shadow-sm mt-4">
                {BRAND.name || "Mulya Bakery"} adalah UMKM roti buatan keluarga,
                dibuat dengan bahan pilihan dan penuh cinta untuk menghadirkan
                kelezatan di setiap gigitan.
              </p>
              <div className="flex items-center gap-3 mb-2">
                <a
                  href={CONTACT.instagramUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#EFE3D3]/90 hover:bg-[#E2D2BF] flex items-center justify-center text-[#4A3B32] transition-colors shadow-sm"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#EFE3D3]/90 hover:bg-[#E2D2BF] flex items-center justify-center text-[#4A3B32] transition-colors shadow-sm"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href={generalOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#EFE3D3]/90 hover:bg-[#E2D2BF] flex items-center justify-center text-[#4A3B32] transition-colors shadow-sm"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
              <div className="text-left text-sm mt-5">
                © {year} {BRAND.name || "Mulya Bakery"}. Semua Hak Dilindungi.
              </div>
            </div>
          </div>

          {/* KOLOM 2: MENU */}
          <div className="lg:col-span-2 pt-2">
            <h3 className="font-bold text-base tracking-wider uppercase text-[#3D2E24]">
              MENU
            </h3>
            <div className="flex items-center gap-1.5 mt-2 mb-6">
              <div className="h-[2px] w-8 bg-[#8C6D58]"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-[#8C6D58]"></div>
            </div>
            <ul className="space-y-3.5 text-sm font-medium text-[#5C4A3E]">
              {[
                { label: "Beranda", href: "#beranda" },
                { label: "Tentang Kami", href: "#tentang-kami" },
                { label: "Produk", href: "#produk" },
                { label: "Testimoni", href: "#testimoni" },
                { label: "Galeri", href: "#galeri" },
                { label: "Kontak", href: "#kontak" },
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.href}
                    className="hover:text-[#8C6D58] transition-colors block text-left"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* KOLOM 3: PRODUK KAMI */}
          <div className="lg:col-span-2 pt-2">
            <h3 className="font-bold text-base tracking-wider uppercase text-[#3D2E24]">
              PRODUK KAMI
            </h3>
            <div className="flex items-center gap-1.5 mt-2 mb-6">
              <div className="h-[2px] w-8 bg-[#8C6D58]"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-[#8C6D58]"></div>
            </div>
            <ul className="space-y-3.5 text-sm font-medium text-[#5C4A3E]">
              {[
                { name: "Roti Manis", icon: "/images/icon-roti-manis.png" },
                { name: "Roti Tawar", icon: "/images/icon-roti-tawar.png" },
                { name: "Roti Isi", icon: "/images/icon-roti-isi.png" },
                { name: "Cake & Pastry", icon: "/images/icon-cake-pastry.png" },
                { name: "Snack", icon: "/images/icon-snack.png" },
              ].map((prod, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span className="text-left">{prod.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* KOLOM 4: HUBUNGI KAMI */}
          <div className="lg:col-span-4 pt-2">
            <h3 className="font-bold text-base tracking-wider uppercase text-[#3D2E24]">
              HUBUNGI KAMI
            </h3>
            <div className="flex items-center gap-1.5 mt-2 mb-6">
              <div className="h-[2px] w-8 bg-[#8C6D58]"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-[#8C6D58]"></div>
            </div>
            <ul className="text-sm text-[#5C4A3E]">
              <li className="py-3 flex items-start gap-3.5 first:pt-0">
                <div className="w-9 h-9 rounded-full bg-[#EFE3D3] flex items-center justify-center shrink-0 mt-0.5 text-[#4A3B32]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-left text-xs sm:text-sm leading-relaxed">
                  <p className="font-semibold text-[#3D2E24]">
                    Rumah Produksi Mulya Bakery
                  </p>
                  <p>
                    {LOCATION.addressLine || "Jl. Melati No. 10, Kec. Sukajadi"}
                    , {LOCATION.city || "Kota Bandung"}
                  </p>
                </div>
              </li>
              <li className="py-3 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#EFE3D3] flex items-center justify-center shrink-0 text-[#4A3B32]">
                  <Phone className="w-4 h-4" />
                </div>
                <a
                  href={`tel:${(CONTACT.phone || "+6281234567890").replace(/\s/g, "")}`}
                  className="text-left hover:text-[#8C6D58] transition-colors"
                >
                  {CONTACT.whatsappDisplay || "+62 812-3456-7890"}
                </a>
              </li>
              <li className="py-3 flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#EFE3D3] flex items-center justify-center shrink-0 text-[#4A3B32]">
                  <Mail className="w-4 h-4" />
                </div>
                <a
                  href={`mailto:${CONTACT.email || "mulyabakery@gmail.com"}`}
                  className="text-left hover:text-[#8C6D58] transition-colors"
                >
                  {CONTACT.email || "mulyabakery@gmail.com"}
                </a>
              </li>
              <li className="py-3 flex items-center gap-3.5 last:pb-0">
                <div className="w-9 h-9 rounded-full bg-[#EFE3D3] flex items-center justify-center shrink-0 text-[#4A3B32]">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-left">Setiap Hari 08.00 - 17.00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE VIEW (DIKUSTOMISASI PERSIS SEPERTI GAMBAR REFERENSI)               */}
        {/* ========================================================================= */}
        <div className="flex lg:hidden flex-col items-center text-center pb-6">
          {/* Logo Brand */}
          <div className="w-full flex flex-col items-center mb-6">
            <img
              src="/images/Logo3.png"
              alt={BRAND.name || "Mulya Bakery"}
              className="w-[180px] h-auto object-contain mb-4"
            />
            <p className="text-xs sm:text-sm leading-relaxed text-[#4A3B32] font-medium px-4 max-w-sm">
              {BRAND.name || "Mulya Bakery"} adalah UMKM roti buatan keluarga,
              dibuat dengan bahan pilihan dan penuh cinta untuk menghadirkan
              kelezatan di setiap gigitan.
            </p>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center gap-3 mb-8">
            <a
              href={CONTACT.instagramUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#EFE3D3]/90 hover:bg-[#E2D2BF] flex items-center justify-center text-[#4A3B32] transition-colors shadow-sm"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#EFE3D3]/90 hover:bg-[#E2D2BF] flex items-center justify-center text-[#4A3B32] transition-colors shadow-sm"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href={generalOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#EFE3D3]/90 hover:bg-[#E2D2BF] flex items-center justify-center text-[#4A3B32] transition-colors shadow-sm"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>

          {/* Accordion Menu */}
          <div className="w-full border-t border-[#E8DCD1]">
            {/* MENU DROPDOWN */}
            <div className="border-b border-[#E8DCD1]">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="w-full py-4 flex items-center justify-between text-left font-bold text-sm tracking-wider uppercase text-[#3D2E24] focus:outline-none"
              >
                <span>MENU</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#3D2E24] transition-transform duration-300 ${
                    openMenu ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                  openMenu
                    ? "grid-rows-[1fr] opacity-100 pb-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="space-y-3 text-sm font-medium text-[#5C4A3E] text-left pl-2">
                    {[
                      { label: "Beranda", href: "#beranda" },
                      { label: "Tentang Kami", href: "#tentang-kami" },
                      { label: "Produk", href: "#produk" },
                      { label: "Testimoni", href: "#testimoni" },
                      { label: "Galeri", href: "#galeri" },
                      { label: "Kontak", href: "#kontak" },
                    ].map((item, idx) => (
                      <li key={idx}>
                        <a
                          href={item.href}
                          className="hover:text-[#8C6D58] transition-colors block"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* PRODUK KAMI DROPDOWN */}
            <div className="border-b border-[#E8DCD1]">
              <button
                onClick={() => setOpenProduct(!openProduct)}
                className="w-full py-4 flex items-center justify-between text-left font-bold text-sm tracking-wider uppercase text-[#3D2E24] focus:outline-none"
              >
                <span>PRODUK KAMI</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#3D2E24] transition-transform duration-300 ${
                    openProduct ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                  openProduct
                    ? "grid-rows-[1fr] opacity-100 pb-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="space-y-3 text-sm font-medium text-[#5C4A3E] text-left pl-2">
                    {[
                      {
                        name: "Roti Manis",
                        icon: "/images/icon-roti-manis.png",
                      },
                      {
                        name: "Roti Tawar",
                        icon: "/images/icon-roti-tawar.png",
                      },
                      { name: "Roti Isi", icon: "/images/icon-roti-isi.png" },
                      {
                        name: "Cake & Pastry",
                        icon: "/images/icon-cake-pastry.png",
                      },
                      { name: "Snack", icon: "/images/icon-snack.png" },
                    ].map((prod, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                       
                        <span>{prod.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* HUBUNGI KAMI DROPDOWN */}
            <div className="border-b border-[#E8DCD1]">
              <button
                onClick={() => setOpenContact(!openContact)}
                className="w-full py-4 flex items-center justify-between text-left font-bold text-sm tracking-wider uppercase text-[#3D2E24] focus:outline-none"
              >
                <span>HUBUNGI KAMI</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#3D2E24] transition-transform duration-300 ${
                    openContact ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                  openContact
                    ? "grid-rows-[1fr] opacity-100 pb-2"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="text-sm text-[#5C4A3E] space-y-1 text-left">
                    <li className="py-2.5 flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#EFE3D3] flex items-center justify-center shrink-0 mt-0.5 text-[#4A3B32]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="text-xs sm:text-sm leading-relaxed">
                        <p className="font-semibold text-[#3D2E24]">
                          Rumah Produksi Mulya Bakery
                        </p>
                        <p>
                          {LOCATION.addressLine ||
                            "Jl. Melati No. 10, Kec. Sukajadi"}
                          , {LOCATION.city || "Kota Bandung"}
                        </p>
                      </div>
                    </li>
                    <li className="py-2.5 flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#EFE3D3] flex items-center justify-center shrink-0 text-[#4A3B32]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <a
                        href={`tel:${(CONTACT.phone || "+6281234567890").replace(/\s/g, "")}`}
                        className="hover:text-[#8C6D58] transition-colors"
                      >
                        {CONTACT.whatsappDisplay || "+62 812-3456-7890"}
                      </a>
                    </li>
                    <li className="py-2.5 flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#EFE3D3] flex items-center justify-center shrink-0 text-[#4A3B32]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <a
                        href={`mailto:${CONTACT.email || "mulyabakery@gmail.com"}`}
                        className="hover:text-[#8C6D58] transition-colors"
                      >
                        {CONTACT.email || "mulyabakery@gmail.com"}
                      </a>
                    </li>
                    <li className="py-2.5 flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-[#EFE3D3] flex items-center justify-center shrink-0 text-[#4A3B32]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span>Setiap Hari 08.00 - 17.00</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian List Kontak Langsung (Selalu Muncul di bawah accordion seperti contoh referensi) */}

          {/* ----------------------------------------------------------------------- */}
          {/* ILUSTRASI DEKORASI SKETSA (UKURAN BESAR, DIBAWAH, BUKAN LAYER)          */}
          {/* ----------------------------------------------------------------------- */}

          {/* Footer Bottom / Copyright Mobile */}
          <div className="w-full pt-4 border-t border-[#E8DCD1] flex flex-col items-center gap-2 text-xs text-[#5C4A3E]">
            <div>
              © {year} {BRAND.name || "Mulya Bakery"}. Semua Hak Dilindungi.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
