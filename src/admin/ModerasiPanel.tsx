import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Check,
  Trash2,
  Star,
  BadgeCheck,
  AlertCircle,
  ImageOff,
  ExternalLink,
} from "lucide-react";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { readableError } from "../lib/supabase";
import { pathStorageDariUrl } from "../lib/storage";
import { sinyalTestimoniBerubah } from "../lib/crosstab";

interface Ulasan {
  id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  rating: number;
  quote: string;
  photo_url: string | null;
  verified_purchase: boolean;
  created_at: string;
}

function Bintang({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${n} dari 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < n ? "fill-caramel text-caramel" : "text-cocoa-500/25"
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}

/**
 * Tab "Testimoni": antrean ulasan BERFOTO yang menunggu persetujuan.
 *
 * Aturannya (lihat migrasi 001): ulasan pelayanan yang menyertakan foto ditahan
 * (is_hidden = true) sampai owner meninjaunya, mencegah foto tak pantas tampil
 * ke publik. Di sini owner bisa SETUJUI (tampilkan) atau TOLAK (hapus ulasan +
 * fotonya) langsung, tanpa membuka Supabase.
 */
export default function ModerasiPanel() {
  const [rows, setRows] = useState<Ulasan[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState<string | null>(null); // id yang sedang diproses

  const muat = useCallback(async () => {
    if (!supabaseAdmin) return;
    setMemuat(true);
    setGalat(null);
    const { data, error } = await supabaseAdmin
      .from("service_reviews")
      .select(
        "id, reviewer_name, reviewer_role, rating, quote, photo_url, verified_purchase, created_at",
      )
      .eq("is_hidden", true)
      .not("photo_url", "is", null)
      .order("created_at", { ascending: false });
    if (error) setGalat(readableError(error));
    else setRows((data ?? []) as Ulasan[]);
    setMemuat(false);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  const setujui = async (row: Ulasan) => {
    if (!supabaseAdmin) return;
    setSibuk(row.id);
    const { error } = await supabaseAdmin
      .from("service_reviews")
      .update({ is_hidden: false })
      .eq("id", row.id);
    setSibuk(null);
    if (error) {
      setGalat(readableError(error));
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    // Beri tahu tab halaman publik (kalau terbuka) agar langsung menampilkannya.
    sinyalTestimoniBerubah();
  };

  const tolak = async (row: Ulasan) => {
    if (!supabaseAdmin) return;
    if (
      !window.confirm(
        `Tolak & hapus ulasan dari "${row.reviewer_name}"? Foto & ulasannya dihapus permanen.`,
      )
    )
      return;
    setSibuk(row.id);

    // Hapus dulu fotonya di Storage (kalau dari bucket kita) agar tak jadi sampah.
    if (row.photo_url) {
      const path = pathStorageDariUrl(row.photo_url, "uploads");
      if (path) {
        await supabaseAdmin.storage.from("uploads").remove([path]);
      }
    }

    const { error } = await supabaseAdmin
      .from("service_reviews")
      .delete()
      .eq("id", row.id);
    setSibuk(null);
    if (error) {
      setGalat(readableError(error));
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };

  return (
    <>
      <div className="mb-5">
        <p className="font-text text-sm text-cocoa-700/70">
          {memuat
            ? "Memuat…"
            : rows.length === 0
              ? "Tidak ada foto yang menunggu"
              : `${rows.length} foto menunggu persetujuan`}
        </p>
        <p className="mt-1 font-text text-xs text-cocoa-700/50">
          Ulasan berfoto ditahan sampai kamu setujui. Ulasan tanpa foto tampil
          otomatis & tidak muncul di sini.
        </p>
      </div>

      {galat && (
        <div className="mb-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="font-text text-sm text-red-700">{galat}</p>
        </div>
      )}

      {memuat ? (
        <div className="flex items-center justify-center gap-2 py-16 text-cocoa-700/60">
          <Loader2 className="h-5 w-5 animate-spin" /> Memuat…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-paper-50 py-16 text-center ring-1 ring-cocoa-700/10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check className="h-7 w-7" />
          </span>
          <p className="mt-3 font-heading text-lg text-cocoa-800">Semua beres</p>
          <p className="mt-1 font-text text-sm text-cocoa-700/60">
            Tidak ada foto testimoni yang perlu ditinjau.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <article
              key={row.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-paper-50 ring-1 ring-cocoa-700/10"
            >
              {/* Foto */}
              <a
                href={row.photo_url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-[4/3] bg-paper-200"
                title="Buka foto ukuran penuh"
              >
                {row.photo_url ? (
                  <img
                    src={row.photo_url}
                    alt={`Foto dari ${row.reviewer_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-cocoa-700/30">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}
                <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-cocoa-900/50 text-paper-50 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <ExternalLink className="h-4 w-4" />
                </span>
              </a>

              {/* Isi */}
              <div className="flex flex-1 flex-col p-4">
                <Bintang n={row.rating} />
                <p className="mt-2 line-clamp-4 font-text text-sm leading-relaxed text-cocoa-800">
                  “{row.quote}”
                </p>
                <div className="mt-3">
                  <p className="flex flex-wrap items-center gap-1.5 font-text text-sm font-bold text-cocoa-800">
                    {row.reviewer_name}
                    {row.verified_purchase && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 font-text text-[10px] font-bold text-green-700">
                        <BadgeCheck className="h-3 w-3" aria-hidden />
                        Terverifikasi
                      </span>
                    )}
                  </p>
                  {row.reviewer_role && (
                    <p className="font-text text-xs text-cocoa-700/60">
                      {row.reviewer_role}
                    </p>
                  )}
                </div>

                {/* Aksi */}
                <div className="mt-4 flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setujui(row)}
                    disabled={sibuk === row.id}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-green-600 px-4 py-2.5 font-text text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-green-700 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {sibuk === row.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Setujui
                  </button>
                  <button
                    type="button"
                    onClick={() => tolak(row)}
                    disabled={sibuk === row.id}
                    title="Tolak & hapus"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-paper-200 px-4 py-2.5 font-text text-sm font-bold text-cocoa-800 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Tolak
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
