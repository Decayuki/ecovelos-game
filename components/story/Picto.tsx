// Pictogrammes SVG au trait (remplacent les emojis) — grille 24, trait 1.6, couleur courante.
const PATHS: Record<string, JSX.Element> = {
  bike: (
    <>
      <circle cx="5.5" cy="16.5" r="3.5" />
      <circle cx="18.5" cy="16.5" r="3.5" />
      <path d="M5.5 16.5 9.5 9h6l3 7.5M9.5 9 12 16.5h-6.5M15.5 9l-1.2-3H17M8 6.5h3" />
      <path d="M12.6 12.2 14 10" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5" />
    </>
  ),
  wrench: <path d="M14.7 4.3a4.5 4.5 0 0 0-5.6 5.9L3.8 15.5a1.9 1.9 0 0 0 2.7 2.7l5.3-5.3a4.5 4.5 0 0 0 5.9-5.6l-2.6 2.6-2.4-.5-.5-2.4 2.5-2.7Z" />,
  megaphone: (
    <>
      <path d="M4 10v4a1 1 0 0 0 1 1h2l9 4.5V4.5L7 9H5a1 1 0 0 0-1 1Z" />
      <path d="M7 15l1.5 4.5h2.5L10 15.6M19 9.5a3 3 0 0 1 0 5" />
    </>
  ),
  handshake: (
    <>
      <path d="M2.5 8.5 6 6.5l3 1 3-1.5 3.5 1L21.5 9" />
      <path d="M2.5 8.5 3.5 15l3 2.5M21.5 9l-1 6-5.5 4" />
      <path d="M12 6 8.5 9.5a1.4 1.4 0 0 0 2 2L13 9.2l5 4.3M9.5 15.5l2 1.8M11.8 13.7l2.3 2" />
    </>
  ),
  wallet: (
    <>
      <path d="M19 7.5V6a1.5 1.5 0 0 0-1.5-1.5h-12A1.5 1.5 0 0 0 4 6v12a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 18v-3" />
      <path d="M4 7.5h15.5A1.5 1.5 0 0 1 21 9v6h-5a3 3 0 0 1 0-6h5" />
      <circle cx="16" cy="12" r=".6" />
    </>
  ),
  crate: (
    <>
      <path d="M12 3 20.5 7.5v9L12 21l-8.5-4.5v-9L12 3Z" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9M7.8 5.3l8.4 4.5" />
    </>
  ),
  speech: (
    <>
      <path d="M4 5.5h16v10H10l-4.5 4v-4H4v-10Z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  check: <path d="M5 12.5 10 17.5 19.5 7" />,
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="M7.5 15.5 11 11l3 2.5 5-6.5" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  arrowDown: <path d="M12 4.5v15M6 13.5l6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  alert: (
    <>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 10v4.5M12 17.2v.3" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
};

export default function Picto({ name, className = 'w-5 h-5', title }: { name: string; className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {PATHS[name] ?? PATHS.compass}
    </svg>
  );
}

export const hasPicto = (name: string) => name in PATHS;
