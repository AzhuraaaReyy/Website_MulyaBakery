/** Ornamen kecil bergaya tangkai gandum (aksen tema bakery). */
export default function WheatSprig({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M16 30V10" strokeLinecap="round" />
      <path d="M16 12c-3-1-5-3-5-6 3 0 5 2 5 5M16 12c3-1 5-3 5-6-3 0-5 2-5 5" />
      <path d="M16 18c-3-1-5-3-5-6 3 0 5 2 5 5M16 18c3-1 5-3 5-6-3 0-5 2-5 5" />
      <path d="M16 24c-3-1-5-3-5-6 3 0 5 2 5 5M16 24c3-1 5-3 5-6-3 0-5 2-5 5" />
    </svg>
  )
}
