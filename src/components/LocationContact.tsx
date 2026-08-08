import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  MapPin,
  Clock,
  Phone,
  Instagram,
  MessageCircle,
  Navigation,
  ArrowUpRight,
  Copy,
  Check,
  Store,
  ShoppingBag,
  Search,
} from "lucide-react";
import { BRAND, CONTACT, LOCATION } from "../config/contact";
import { generalOrderUrl } from "../lib/whatsapp";
import { useScrolly } from "../hooks/useScrolly";

export default function LocationContact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  useScrolly(sectionRef);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const cleanupMapRef = useRef<(() => void) | null>(null);

  const [disalin, setDisalin] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk melacak posisi sentuhan & drag gesture secara real-time
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
    setTouchEnd(null);
    setDragOffset(0);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentY = e.targetTouches[0].clientY;
    setTouchEnd(currentY);
    const distance = touchStart - currentY; // Positif jika ditarik ke atas, negatif jika ke bawah
    setDragOffset(distance);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) {
      setIsBottomSheetExpanded(true);
    } else if (distance < -minSwipeDistance) {
      setIsBottomSheetExpanded(false);
    }

    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Kalkulasi tinggi dinamis agar mengikuti jari secara real-time tanpa jeda
  const getBottomSheetStyle = () => {
    if (isDragging && typeof window !== "undefined") {
      const baseHeight = isBottomSheetExpanded
        ? window.innerHeight * 0.82
        : 320;
      const newHeight = baseHeight + dragOffset;
      return {
        height: `${Math.max(140, Math.min(window.innerHeight * 0.9, newHeight))}px`,
        transition: "none", // Matikan transisi saat ditarik agar responsif instan
      };
    }
    return {
      transition: "all 0.5s cubic-bezier(0.32,0.72,0,1)",
    };
  };

  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    LOCATION.mapsQuery,
  )}`;

  const alamatLengkap = `${LOCATION.addressLine}, ${LOCATION.city}`;

  const salinAlamat = async () => {
    try {
      await navigator.clipboard.writeText(alamatLengkap);
      setDisalin(true);
      window.setTimeout(() => setDisalin(false), 2000);
    } catch {
      /* clipboard diblokir browser — abaikan */
    }
  };

  // Koordinat toko Mulya Bakery (dari link Google Maps)
  // https://maps.app.goo.gl/4d1EBhvuAwdj9ekZ7
  const TOKO_LNG = 110.3929844;
  const TOKO_LAT = -7.1287625;

  // Fungsi untuk memusatkan kembali peta ke koordinat toko
  const resetPetaKeToko = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [TOKO_LNG, TOKO_LAT],
        zoom: 15,
        essential: true,
      });
    }
  };

  // Inisialisasi MapLibre GL JS dengan OpenStreetMap Raster Style Inline.
  //
  // OPTIMASI LAZY-LOAD: map hanya dibuat ketika section "Lokasi & Kontak" mulai
  // terlihat di layar (IntersectionObserver). Sebelum user scroll ke sini, tidak
  // ada tile OSM yang diunduh sama sekali — membuat halaman awal terasa jauh
  // lebih ringan & cepat. Map dibuat hanya SEKALI (dijaga oleh mapInstanceRef
  // dan flag "sudahLihat").
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    // Jika IntersectionObserver tidak tersedia, fallback: langsung buat map.
    if (typeof IntersectionObserver === "undefined") {
      initMap(el);
      return;
    }

    let sudahLihat = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (sudahLihat) return;
        if (entries.some((e) => e.isIntersecting)) {
          sudahLihat = true;
          initMap(el);
          observer.disconnect();
        }
      },
      // Mulai muat sedikit SEBELUM section benar-benar masuk layar (±160px),
      // supaya tile sudah siap saat user sampai di sana.
      { rootMargin: "160px 0px", threshold: 0.01 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cleanupMapRef.current?.();
    };
  }, []);

  function initMap(container: HTMLElement) {
    if (mapInstanceRef.current) return;

    const lng = TOKO_LNG;
    const lat = TOKO_LAT;

    const map = new maplibregl.Map({
      container,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm-tiles-layer",
            type: "raster",
            source: "osm-tiles",
            minzoom: 0,
            // Batasi zoom maksimal ke 17 — cukup untuk lokasi toko sekaligus
            // mengurangi jumlah tile yang diunduh (map lebih ringan & cepat).
            maxzoom: 17,
          },
        ],
      },
      center: [lng, lat],
      zoom: 15,
      interactive: true,
    });

    const markerEl = document.createElement("div");
    markerEl.innerHTML = `
      <div style="background-color: #b45309; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2.5px solid #fff; transition: transform 0.3s ease;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    `;

    new maplibregl.Marker({ element: markerEl })
      .setLngLat([lng, lat])
      .addTo(map);

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.resize();
    }, 250);

    // Simpan fungsi pembersih — dipanggil saat komponen unmount (bila map sudah dibuat).
    cleanupMapRef.current = () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      cleanupMapRef.current = null;
    };
  }

  const kontak = [
    {
      label: "WhatsApp",
      value: CONTACT.whatsappDisplay,
      href: generalOrderUrl(),
      Icon: MessageCircle,
      chip: "bg-[#25D366]",
      external: true,
    },
    {
      label: "Instagram",
      value: `@${CONTACT.instagram}`,
      href: CONTACT.instagramUrl,
      Icon: Instagram,
      chip: "bg-gradient-to-br from-[#E1306C] to-[#F77737]",
      external: true,
    },
    {
      label: "Telepon",
      value: CONTACT.phone,
      href: `tel:${CONTACT.phone.replace(/\s/g, "")}`,
      Icon: Phone,
      chip: "bg-cocoa-800",
      external: false,
    },
  ];

  return (
    <div id="kontak" ref={sectionRef} className="w-full">
      {/* SECTION 1: Header / Title Section */}
      <section className="relative overflow-hidden bg-paper-200 pt-12 pb-10 lg:pt-16 lg:pb-12">
        <div
          className="paper-grain pointer-events-none absolute inset-0 opacity-60 z-10"
          aria-hidden
        />

        <div className="container-wide relative z-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            {/* Badge Eyebrow */}
            <div
              data-reveal
              className="inline-flex items-center gap-2 rounded-full bg-caramel/20 px-3.5 py-1 text-xs font-semibold text-cocoa-800 sm:text-sm transition-all duration-700 hover:scale-105"
            >
              <span className="h-2 w-2 rounded-full bg-caramel animate-pulse"></span>
              <span className="eyebrow-script !m-0">Lokasi &amp; Kontak</span>
            </div>

            <h2
              data-reveal
              style={{ transitionDelay: "150ms" }}
              className="title-1 mt-2 text-2xl  tracking-tight text-cocoa-900 sm:text-3xl lg:text-4xl transition-all duration-700"
            >
              Mampir atau <br />
              Hubungi Kami
            </h2>

            <p
              data-reveal
              style={{ transitionDelay: "300ms" }}
              className="font-section3-p mt-3 text-center text-base leading-relaxed text-cocoa-700/85 sm:text-lg lg:text-xl transition-all duration-700"
            >
              Roti hangat selalu menunggu di toko kami — atau kirim pesan, tim
              Mulya Bakery siap membantu setiap hari.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Full-Width Edge-to-Edge Map & Card Section */}
      <section className="relative w-full overflow-hidden bg-paper-200 pb-0">
        <div className="w-full px-0">
          <div
            data-reveal
            style={{ transitionDelay: "400ms" }}
            className="relative w-full h-[680px] sm:h-[720px] lg:h-[780px] overflow-hidden shadow-cocoa-lg bg-paper-100 transition-all duration-1000"
          >
            {/* Map Container */}
            <div
              ref={mapContainerRef}
              className="absolute inset-0 z-0 w-full h-full transition-transform duration-700"
            />

            {/* ================= MOBILE EXCLUSIVE ELEMENTS (lg:hidden) ================= */}

            {/* 1. Mobile Search Bar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-2 rounded-full bg-paper-50/95 px-4 py-2.5 shadow-cocoa ring-1 ring-cocoa-700/10 backdrop-blur-md lg:hidden">
              <Search className="h-4 w-4 text-cocoa-700/60 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari alamat, kode pos, atau kota"
                className="w-full bg-transparent font-text text-xs text-cocoa-900 placeholder:text-cocoa-700/50 focus:outline-none"
              />
              <button
                type="button"
                className="shrink-0 inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1.5 font-text text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
              >
                Cari
              </button>
            </div>

            {/* 2. Mobile Floating CTA Button to Return to Store (Re-center) */}
            <div className="absolute right-4 bottom-[340px] z-20 flex flex-col gap-2 lg:hidden">
              <button
                type="button"
                onClick={resetPetaKeToko}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-50 text-cocoa-800 shadow-cocoa ring-1 ring-cocoa-700/10 backdrop-blur-md active:scale-95 transition-transform"
                title="Kembali ke toko"
              >
                <MapPin className="h-5 w-5 text-rose-600" strokeWidth={2.2} />
              </button>
            </div>

            {/* 3. Mobile Bottom Sheet Popup with Fluid Touch Drag */}
            <div
              style={getBottomSheetStyle()}
              className={`absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-[2rem] shadow-cocoa-lg ring-1 ring-cocoa-700/15 backdrop-blur-xl flex flex-col pointer-events-auto lg:hidden ${
                !isDragging
                  ? isBottomSheetExpanded
                    ? "h-[82%]"
                    : "h-auto max-h-[320px]"
                  : ""
              }`}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {/* Drag Handle & Toggle Header with Touch Gestures */}
              <div
                onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="w-full pt-3 pb-2 flex flex-col items-center cursor-pointer shrink-0 select-none touch-none"
              >
                <div className="w-12 h-1.5 rounded-full bg-rose-300/60 mb-2 transition-transform duration-300 hover:scale-110"></div>
                <div className="w-full px-5 flex items-center justify-between">
                  <h4 className="font-heading text-xs font-bold text-cocoa-800 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-600" /> Lokasi
                    Terdekat
                  </h4>
                  <span className="font-text text-[10px] text-rose-600 font-semibold underline">
                    {isBottomSheetExpanded
                      ? "Tutup detail"
                      : "Geser ke atas untuk detail"}
                  </span>
                </div>
              </div>

              {/* Bottom Sheet Content (Scrollable & Scrollbar Hidden) */}
              <div className="px-4 pb-8 overflow-y-auto space-y-3 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Store Preview Card */}
                <div
                  onClick={() => setIsBottomSheetExpanded(true)}
                  className="bg-paper-100 rounded-2xl p-3 ring-1 ring-cocoa-700/10 flex items-center justify-between gap-3 cursor-pointer hover:bg-paper-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-rose-50 ring-1 ring-rose-200 overflow-hidden shrink-0">
                      <img
                        src="/images/icontoko.png"
                        alt="Store"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-heading text-sm font-bold text-cocoa-800 truncate">
                        {BRAND.name}
                      </h5>
                      <p className="font-text text-[11px] text-cocoa-700/70">
                        Toko Roti Rumahan
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-text text-[10px] font-bold">
                          Toko utama
                        </span>
                        <span className="font-text text-[11px] text-emerald-700 font-semibold">
                          Buka • {LOCATION.hours[0]?.time ?? "08.00 - 23.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-cocoa-700/50 shrink-0" />
                </div>

                {/* Expanded Details Content */}
                {isBottomSheetExpanded && (
                  <div className="space-y-3 pt-2 animate-fadeIn transition-all duration-300">
                    {/* Address Section with Image */}
                    <div className="flex items-center justify-between gap-3 bg-paper-100/60 rounded-xl p-2.5 ring-1 ring-cocoa-700/10">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 ring-1 ring-rose-200">
                          <MapPin className="h-4 w-4" strokeWidth={2.2} />
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-heading text-xs  text-cocoa-800">
                            Alamat toko
                          </h4>
                          <p className="mt-0.5 font-text text-[11px] leading-relaxed text-cocoa-700/85">
                            {LOCATION.addressLine}
                          </p>
                          <p className="font-text text-[11px] text-cocoa-700/85">
                            {LOCATION.city}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 w-14 h-14">
                        <div className="w-full h-full rounded-lg bg-rose-50/80 ring-1 ring-rose-200/60 flex items-center justify-center overflow-hidden">
                          <img
                            src="/images/icontoko.png"
                            alt="Storefront"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={salinAlamat}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 font-text text-xs font-bold transition-all shadow-sm ${
                          disalin
                            ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                            : "bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {disalin ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Salin alamat
                          </>
                        )}
                      </button>
                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-2 font-text text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700"
                      >
                        <Navigation className="h-3.5 w-3.5" /> Rute ke sini
                      </a>
                    </div>

                    {/* Jam Buka */}
                    <div className="relative overflow-hidden rounded-xl bg-[#2D1B12] p-3 text-paper-50 shadow-sm">
                      <div className="relative">
                        <h3 className="flex items-center gap-1.5 font-script text-base text-rose-300">
                          <Clock className="h-3.5 w-3.5" strokeWidth={1.8} />{" "}
                          Jam buka &amp; tutup
                        </h3>
                        <ul className="mt-1.5 space-y-1">
                          {LOCATION.hours.map((h) => (
                            <li
                              key={h.day}
                              className="flex items-center justify-between gap-2 border-b border-dashed border-rose-300/20 pb-1 last:border-b-0 last:pb-0"
                            >
                              <span className="font-text text-[11px] text-paper-200/85">
                                {h.day}
                              </span>
                              <span className="font-text text-[11px] font-bold tabular-nums text-rose-200">
                                {h.time}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Kontak Langsung */}
                    <div>
                      <h3 className="font-heading text-xs text-cocoa-800 mb-1.5">
                        Hubungi langsung
                      </h3>
                      <div className="space-y-1.5">
                        {kontak.map((k) => (
                          <a
                            key={k.label}
                            href={k.href}
                            {...(k.external
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            className="group flex items-center justify-between gap-2 rounded-xl bg-paper-100 px-3 py-2 ring-1 ring-cocoa-700/10 hover:bg-paper-50"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${k.chip}`}
                              >
                                <k.Icon className="h-3.5 w-3.5" />
                              </span>
                              <div className="min-w-0">
                                <span className="block font-text text-[9px] font-bold uppercase tracking-wider text-rose-600/80 leading-none">
                                  {k.label}
                                </span>
                                <span className="block truncate font-text text-xs font-bold text-cocoa-800 mt-0.5">
                                  {k.value}
                                </span>
                              </div>
                            </div>
                            <ArrowUpRight className="h-3.5 w-3.5 text-cocoa-700/50" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Custom Order Banner */}
                    <div className="rounded-xl bg-rose-50/90 p-3 ring-1 ring-rose-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white shadow-sm">
                          <ShoppingBag className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-heading text-xs  text-cocoa-800">
                            Terima pesanan custom!
                          </h4>
                          <p className="font-text text-[11px] text-cocoa-700/80 truncate">
                            Roti ulang tahun, hampers, &amp; pesanan khusus.
                          </p>
                        </div>
                      </div>
                      <a
                        href={generalOrderUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 font-text text-[11px] font-bold text-white shadow-md shadow-rose-600/20"
                      >
                        <MessageCircle className="h-3 w-3" /> Chat
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ================= DESKTOP EXCLUSIVE ELEMENTS (hidden lg:flex) ================= */}

            {/* Tombol Reset/Pusatkan Peta (Top Left CTA) - Desktop Only */}
            <button
              type="button"
              onClick={resetPetaKeToko}
              className="absolute left-6 top-6 z-20 hidden lg:flex items-center gap-3 rounded-2xl bg-paper-50/95 px-4 py-3 shadow-cocoa ring-1 ring-cocoa-700/10 backdrop-blur-md transition-all duration-300 hover:bg-paper-50 hover:scale-105 cursor-pointer text-left"
              title="Klik untuk kembali ke lokasi toko"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-caramel text-paper-50 shrink-0">
                <MapPin className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div>
                <p className="font-heading text-sm text-cocoa-800">
                  {BRAND.name}
                </p>
                <p className="font-text text-xs text-cocoa-700/70">
                  Klik untuk kembali ke toko
                </p>
              </div>
            </button>

            {/* Card Kanan - Desktop Only */}
            <div className="absolute right-6 top-6 bottom-6 z-30 w-[420px] hidden lg:flex flex-col pointer-events-auto">
              <div className="relative flex flex-col h-full rounded-[2rem] bg-paper-50/95 p-4 shadow-cocoa-lg ring-1 ring-cocoa-700/15 backdrop-blur-xl overflow-y-auto space-y-2.5">
                {/* Hero Image Card */}
                <div className="relative overflow-hidden rounded-xl bg-paper-100 ring-1 ring-cocoa-700/10 h-44 shadow-sm shrink-0 group">
                  <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-text text-[10px] font-bold shadow-md">
                    <Store className="h-3 w-3" /> TOKO FISIK KAMI
                  </span>
                  <img
                    src="/images/icontoko.png"
                    alt={`${BRAND.name} Toko`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/90 via-cocoa-900/30 to-transparent flex items-end p-3.5">
                    <div className="text-paper-50">
                      <h3 className="font-heading text-xl font-bold tracking-tight text-white">
                        {BRAND.name}
                      </h3>
                      <p className="font-text text-xs text-paper-200/90">
                        Toko Roti &amp; Kue Tradisional
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address & Store Image Section */}
                <div className="flex items-center justify-between gap-3 bg-paper-100/60 rounded-xl p-2.5 ring-1 ring-cocoa-700/10 shrink-0">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 ring-1 ring-rose-200">
                      <MapPin className="h-4 w-4" strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-heading text-sm font-bold text-cocoa-800">
                        Alamat toko
                      </h4>
                      <p className="mt-0.5 font-text text-xs leading-relaxed text-cocoa-700/85">
                        {LOCATION.addressLine}
                      </p>
                      <p className="font-text text-xs text-cocoa-700/85">
                        {LOCATION.city}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 w-16 h-16">
                    <div className="w-full h-full rounded-lg bg-rose-50/80 ring-1 ring-rose-200/60 flex items-center justify-center overflow-hidden">
                      <img
                        src="/images/icontoko.png"
                        alt="Storefront"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={salinAlamat}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 font-text text-xs font-bold transition-all shadow-sm ${
                      disalin
                        ? "bg-green-100 text-green-700 ring-1 ring-green-300 scale-105"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    {disalin ? (
                      <>
                        <Check className="h-3.5 w-3.5 animate-bounce" />{" "}
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Salin alamat
                      </>
                    )}
                  </button>
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1.5 font-text text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700"
                  >
                    <Navigation className="h-3.5 w-3.5" /> Rute ke sini
                  </a>
                </div>

                {/* Jam Buka */}
                <div className="relative overflow-hidden rounded-xl bg-[#2D1B12] p-2.5 text-paper-50 shadow-sm shrink-0">
                  <div className="relative">
                    <h3 className="flex items-center gap-1.5 font-script text-base text-rose-300">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.8} /> Jam
                      buka &amp; tutup
                    </h3>
                    <ul className="mt-1 space-y-1">
                      {LOCATION.hours.map((h) => (
                        <li
                          key={h.day}
                          className="flex items-center justify-between gap-2 border-b border-dashed border-rose-300/20 pb-1 last:border-b-0 last:pb-0"
                        >
                          <span className="font-text text-[11px] text-paper-200/85">
                            {h.day}
                          </span>
                          <span className="font-text text-[11px] font-bold tabular-nums text-rose-200">
                            {h.time}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Hubungi Langsung */}
                <div className="shrink-0">
                  <h3 className="font-heading text-xs font-bold text-cocoa-800 mb-1">
                    Hubungi langsung
                  </h3>
                  <div className="space-y-1.5">
                    {kontak.map((k) => (
                      <a
                        key={k.label}
                        href={k.href}
                        {...(k.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="group flex items-center justify-between gap-2 rounded-xl bg-paper-100 px-3 py-1.5 ring-1 ring-cocoa-700/10 hover:bg-paper-50"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${k.chip}`}
                          >
                            <k.Icon className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <span className="block font-text text-[9px] font-bold uppercase tracking-wider text-rose-600/80 leading-none">
                              {k.label}
                            </span>
                            <span className="block truncate font-text text-xs font-bold text-cocoa-800 mt-0.5">
                              {k.value}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="h-3 w-3 text-cocoa-700/50" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Custom Order Banner */}
                <div className="rounded-xl bg-rose-50/90 p-2.5 ring-1 ring-rose-200/80 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white shadow-sm">
                      <ShoppingBag className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-heading text-xs font-bold text-cocoa-800">
                        Terima pesanan custom!
                      </h4>
                      <p className="font-text text-[11px] text-cocoa-700/80 truncate">
                        Roti ulang tahun, hampers, &amp; pesanan khusus.
                      </p>
                    </div>
                  </div>
                  <a
                    href={generalOrderUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 font-text text-[11px] font-bold text-white shadow-md shadow-rose-600/20"
                  >
                    <MessageCircle className="h-3 w-3" /> Chat
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
