type IconProps = {
  name: IconName;
  className?: string;
};

/**
 * Inline stroke icons drawn on the same 24px grid as the wbill mark, so the
 * site keeps a single drawing language and pulls in no icon dependency.
 * Every glyph inherits `currentColor` and the parent's size.
 */
const paths: Record<string, React.ReactNode> = {
  receipt: (
    <>
      <path d="M6 3.5h12v17l-2.4-1.6-2.4 1.6-2.4-1.6-2.4 1.6L6 20.5z" />
      <path d="M9.5 8.5h5M9.5 12.5h5" />
    </>
  ),
  percent: (
    <>
      <path d="M18 6 6 18" />
      <circle cx="7.75" cy="7.75" r="2.25" />
      <circle cx="16.25" cy="16.25" r="2.25" />
    </>
  ),
  document: (
    <>
      <path d="M13.5 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8.5z" />
      <path d="M13.5 3.5v5h5" />
      <path d="M9 13h6M9 16.5h4" />
    </>
  ),
  chat: (
    <>
      <path d="M20.5 11.5a8 8 0 0 1-11.9 7L3.5 20.5l2-5.1a8 8 0 1 1 15 -3.9z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3" />
      <path d="M3.5 19.5a6 6 0 0 1 12 0" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M17.2 14.4a6 6 0 0 1 3.3 5.1" />
    </>
  ),
  chart: (
    <>
      <path d="M3.5 20.5h17" />
      <path d="M7 17V10M12 17V5.5M17 17v-4.5" />
    </>
  ),
  phone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 5.5h3" />
      <path d="M11 18.5h2" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="12" r="3.5" />
      <path d="M11.5 12h9M17.5 12v3M20.5 12v2.5" />
    </>
  ),
  bolt: <path d="M13.5 2.5 5 13.5h5.5L9.5 21.5 19 10.5h-5.5z" />,
  shield: (
    <>
      <path d="M12 2.8 19 5.6v5.7c0 4.3-2.9 8.1-7 9.4-4.1-1.3-7-5.1-7-9.4V5.6z" />
      <path d="M9.2 11.9 11.3 14l3.5-3.8" />
    </>
  ),
  check: <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />,
  cross: <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />,
  chevron: <path d="M6 9.5 12 15.5 18 9.5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  arrow: <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  sparkle: (
    <>
      <path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9z" />
      <path d="M18.5 16.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.5 3.5 8l8.5 4.5L20.5 8z" />
      <path d="M3.5 12.5 12 17l8.5-4.5" />
      <path d="M3.5 16.5 12 21l8.5-4.5" />
    </>
  ),
  hash: <path d="M9 3.5 7 20.5M17 3.5l-2 17M4.5 8.5h15M3.5 15.5h15" />,
};

export type IconName =
  | 'receipt' | 'percent' | 'document' | 'chat' | 'clock' | 'users' | 'chart'
  | 'phone' | 'key' | 'bolt' | 'shield' | 'check' | 'cross' | 'chevron'
  | 'menu' | 'arrow' | 'sparkle' | 'layers' | 'hash';

export default function Icon({ name, className = 'h-5 w-5' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
