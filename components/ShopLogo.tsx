import { logoSrc } from '@/lib/logos';

/** The shop's logo, or its initial on a tinted square when it has none. */
export default function ShopLogo({
  logo,
  name,
  size = 48,
  className = '',
}: {
  logo?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const src = logoSrc(logo);
  const style = { width: size, height: size };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- data URLs; next/image adds nothing here.
    return <img src={src} alt={`${name} logo`} style={style} className={`shrink-0 rounded-xl object-contain ${className}`} />;
  }
  return (
    <span
      aria-hidden="true"
      style={{ ...style, fontSize: size * 0.42 }}
      className={`flex shrink-0 items-center justify-center rounded-xl bg-primary/10 font-semibold text-primary ${className}`}
    >
      {(name.trim()[0] ?? 'W').toUpperCase()}
    </span>
  );
}
