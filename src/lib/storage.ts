/**
 * Ambil PATH objek di dalam bucket dari sebuah URL publik Supabase Storage.
 *
 * URL publik berbentuk:
 *   https://<proj>.supabase.co/storage/v1/object/public/<bucket>/<path...>
 * Untuk menghapus objek (storage.remove) kita butuh <path...> saja, bukan URL
 * lengkapnya. Mengembalikan null bila URL tidak cocok (mis. tautan eksternal),
 * supaya pemanggil bisa melewati penghapusan dengan aman.
 */
export function pathStorageDariUrl(url: string, bucket: string): string | null {
  const tanda = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(tanda);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + tanda.length));
}
