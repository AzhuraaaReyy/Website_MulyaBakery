import { useCallback, useEffect, useRef, useState } from "react";
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  PenLine,
  BadgeCheck,
  MessageSquarePlus,
} from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import ReviewModal from "./ReviewModal";
import { supabase } from "../lib/supabase";
import { dengarkan } from "../lib/dataevents";
import { dengarTestimoniLintasTab } from "../lib/crosstab";
import { useScrolly } from "../hooks/useScrolly";

interface UlasanPelayanan {
  id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  rating: number;
  quote: string;
  photo_url: string | null;
  verified_purchase: boolean;
  created_at: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-caramel text-caramel"
              : "fill-cocoa-900/15 text-cocoa-900/15"
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrolly(sectionRef);

  const [ulasan, setUlasan] = useState<UlasanPelayanan[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [tulisTerbuka, setTulisTerbuka] = useState(false);
  const [aktifIndex, setAktifIndex] = useState(0);

  // STATE & REF UNTUK FITUR DRAG (MOUSE & TOUCH)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const hasDraggedRef = useRef(false);

  const muat = useCallback(async () => {
    if (!supabase) {
      setUlasan([]);
      setMemuat(false);
      return;
    }
    try {
      const { data, error } = await supabase.rpc("get_service_reviews", {
        p_limit: 15,
      });
      if (error) throw error;

      const listData = (data ?? []) as UlasanPelayanan[];
      setUlasan(listData);

      // Set index aktif ke elemen paling tengah saat data selesai dimuat
      if (listData.length > 0) {
        setAktifIndex(Math.floor(listData.length / 2));
      }
    } catch (err) {
      console.error("[Testimonials] gagal memuat ulasan:", err);
      setUlasan([]);
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  useEffect(() => dengarkan("ulasan-pelayanan", () => void muat()), [muat]);
  useEffect(() => dengarTestimoniLintasTab(() => void muat()), [muat]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void muat();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [muat]);

  // Fungsi Navigasi Slider
  const geser = useCallback(
    (arah: "kiri" | "kanan") => {
      if (arah === "kiri") {
        setAktifIndex((prev) => (prev > 0 ? prev - 1 : ulasan.length - 1));
      } else {
        setAktifIndex((prev) => (prev < ulasan.length - 1 ? prev + 1 : 0));
      }
    },
    [ulasan.length],
  );

  // HANDLER DRAG / SWIPE (MOUSE & TOUCH)
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
    hasDraggedRef.current = false;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = startX - clientX;
    setDragOffset(diff);
    if (Math.abs(diff) > 8) {
      hasDraggedRef.current = true;
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 40;
    if (dragOffset > threshold) {
      geser("kanan");
    } else if (dragOffset < -threshold) {
      geser("kiri");
    }
    setDragOffset(0);
  };

  // Kalkulasi Tampilan 3D Coverflow
  const getCardStyle3D = (diff: number) => {
    if (diff === 0) {
      return {
        transform: "translateX(0%) scale(1) rotateY(0deg)",
        opacity: 1,
        filter: "blur(0px)",
        zIndex: 30,
        pointerEvents: "auto" as const,
      };
    } else if (diff === -1) {
      return {
        transform: "translateX(-58%) scale(0.85) rotateY(16deg)",
        opacity: 0.55,
        filter: "blur(1.5px)",
        zIndex: 20,
        pointerEvents: "auto" as const,
      };
    } else if (diff === 1) {
      return {
        transform: "translateX(58%) scale(0.85) rotateY(-16deg)",
        opacity: 0.55,
        filter: "blur(1.5px)",
        zIndex: 20,
        pointerEvents: "auto" as const,
      };
    } else if (diff === -2) {
      return {
        transform: "translateX(-110%) scale(0.7) rotateY(28deg)",
        opacity: 0.25,
        filter: "blur(3px)",
        zIndex: 10,
        pointerEvents: "auto" as const,
      };
    } else if (diff === 2) {
      return {
        transform: "translateX(110%) scale(0.7) rotateY(-28deg)",
        opacity: 0.25,
        filter: "blur(3px)",
        zIndex: 10,
        pointerEvents: "auto" as const,
      };
    } else if (diff < -2) {
      return {
        transform: "translateX(-150%) scale(0.55) rotateY(35deg)",
        opacity: 0,
        filter: "blur(5px)",
        zIndex: 0,
        pointerEvents: "none" as const,
      };
    } else {
      return {
        transform: "translateX(150%) scale(0.55) rotateY(-35deg)",
        opacity: 0,
        filter: "blur(5px)",
        zIndex: 0,
        pointerEvents: "none" as const,
      };
    }
  };

  const count = ulasan.length;

  return (
    <section
      id="testimoni"
      ref={sectionRef}
      className="testimonials-section relative w-full overflow-hidden bg-paper-100 py-12 sm:py-16 lg:py-20"
    >
      {/* Import & Style Custom Font 'Itim' */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
        .font-card-custom {
          font-family: 'Itim', cursive, sans-serif !important;
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header Section */}
        <div className="mx-auto mb-8 flex max-w-2xl flex-col items-center text-center sm:mb-12">
          {/* Badge Eyebrow */}
          <div
            data-reveal
            className="inline-flex items-center gap-2 rounded-full bg-caramel/20 px-3.5 py-1 text-xs font-semibold text-cocoa-800 sm:text-sm"
          >
            <span className="h-2 w-2 rounded-full bg-caramel"></span>
            <span className="eyebrow-script !m-0">Testimoni Pelanggan</span>
          </div>

          <h2
            data-reveal
            className="title-1 mt-2 text-2xl font-bold tracking-tight text-cocoa-900 sm:text-3xl lg:text-4xl"
          >
            Cerita Manis dari Pelanggan Kami
          </h2>

          <p
            data-reveal
            className="font-section3-p mt-3 text-center text-base leading-relaxed text-cocoa-700/85 sm:text-lg lg:text-xl"
          >
            Kepuasan pelanggan adalah kebanggaan kami. Simak pengalaman mereka
            menikmati roti dan kue segar buatan Mulya Bakery yang selalu dibuat
            dengan penuh cinta.
          </p>
        </div>

        {/* Content Area */}
        {memuat ? (
          <div className="flex justify-center items-center h-[380px]">
            <div className="h-96 w-80 animate-pulse rounded-3xl bg-white/60 border border-cocoa-900/10 shadow-md" />
          </div>
        ) : count === 0 ? (
          /* Empty State */
          <div className="mx-auto max-w-xl text-center rounded-3xl bg-white p-6 sm:p-12 border border-cocoa-900/10 shadow-lg backdrop-blur-md mb-6">
            <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-paper-200 text-cocoa-900 mb-4">
              <MessageSquarePlus
                className="h-7 w-7 sm:h-8 sm:w-8"
                aria-hidden
              />
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-cocoa-900">
              Belum Ada Ulasan
            </h3>
            <p className="mt-2 font-card-custom text-sm text-cocoa-700/80 leading-relaxed">
              Jadilah pembeli pertama yang membagikan pengalaman kelezatan
              sajian roti buatan kami.
            </p>
            <button
              type="button"
              onClick={() => setTulisTerbuka(true)}
              className="font-card-custom mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-cocoa-800 shadow-md ring-1 ring-cocoa-900/10 transition-all hover:bg-pink-500 hover:text-white hover:ring-pink-500 active:scale-95"
            >
              <PenLine className="h-4 w-4" aria-hidden />
              Tulis Ulasan Pertama
            </button>
          </div>
        ) : (
          /* Card Testimoni Slider 3D Coverflow */
          <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
            <div className="relative w-full flex items-center justify-center">
              {/* Tombol Panah Kiri & Kanan */}
              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => geser("kiri")}
                    aria-label="Ulasan sebelumnya"
                    className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-40 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white text-cocoa-900 shadow-xl border border-cocoa-900/10 hover:bg-pink-500 hover:text-white transition-all active:scale-90"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => geser("kanan")}
                    aria-label="Ulasan berikutnya"
                    className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-40 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white text-cocoa-900 shadow-xl border border-cocoa-900/10 hover:bg-pink-500 hover:text-white transition-all active:scale-90"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </>
              )}

              {/* CONTAINER SLIDER WITH MOUSE DRAG & TOUCH LISTENERS */}
              <div
                className={`relative w-full h-[365px] sm:h-[385px] flex items-center justify-center overflow-hidden [perspective:1200px] select-none ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseMove={(e) => handleDragMove(e.clientX)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleDragEnd}
              >
                {ulasan.map((item, index) => {
                  const diff = index - aktifIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (!hasDraggedRef.current) {
                          setAktifIndex(index);
                        }
                      }}
                      style={getCardStyle3D(diff)}
                      className="absolute w-[280px] sm:w-[320px] md:w-[340px] flex flex-col justify-between rounded-3xl bg-white p-6 sm:p-7 shadow-xl border border-cocoa-900/10 transition-all duration-500 ease-out h-[360px] sm:h-[380px] cursor-pointer"
                    >
                      {/* Ikon Quote (Sudut Kanan Atas) */}
                      <div className="absolute top-5 right-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-caramel/15 text-caramel border border-caramel/25">
                        <Quote className="h-4 w-4 fill-caramel" aria-hidden />
                      </div>

                      {/* Foto Profil & Nama */}
                      <div className="flex flex-col items-center text-center shrink-0 pt-2">
                        <div className="h-20 w-20 sm:h-22 sm:w-22 shrink-0 overflow-hidden rounded-full border-2 border-caramel/40 bg-paper-100 shadow-md">
                          <PlaceholderImage
                            alt={item.reviewer_name}
                            src={item.photo_url ?? ""}
                            label={item.reviewer_name}
                            seed={item.id}
                            rounded="rounded-full"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="mt-3.5 flex items-center justify-center gap-1.5 max-w-full px-2">
                          <h4 className="font-card-custom text-base sm:text-lg font-bold text-cocoa-900 truncate">
                            {item.reviewer_name}
                          </h4>
                          {item.verified_purchase && (
                            <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                          )}
                        </div>
                      </div>

                      {/* Rating Bintang */}
                      <div className="mt-2 flex items-center justify-center shrink-0">
                        <Stars rating={item.rating} />
                      </div>

                      {/* Teks Ulasan */}
                      <div className="my-2 flex-1 flex items-start justify-center overflow-hidden text-center">
                        <p className="font-card-custom text-sm sm:text-base italic leading-relaxed text-cocoa-700/85 line-clamp-3 sm:line-clamp-4">
                          "{item.quote}"
                        </p>
                      </div>

                      {/* Footer Tanggal */}
                      <div className="pt-3 border-t border-cocoa-900/10 flex items-center justify-between font-card-custom text-xs text-cocoa-700/60 shrink-0 w-full">
                        <span>Ulasan Terverifikasi</span>
                        <span>
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tombol CTA Bagikan Pengalamanmu di Bawah Card */}
            <div className="mt-8 sm:mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setTulisTerbuka(true)}
                className="font-card-custom inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 px-7 py-3.5 text-sm sm:text-base font-semibold text-white shadow-md ring-1 ring-pink-500 transition-all duration-300 hover:bg-none hover:bg-white hover:text-pink-600 hover:ring-cocoa-900/10 active:scale-95 hover:transition-transform"
              >
                <PenLine className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                Bagikan Pengalamanmu
              </button>
            </div>
          </div>
        )}
      </div>

      <ReviewModal open={tulisTerbuka} onClose={() => setTulisTerbuka(false)} />
    </section>
  );
}
