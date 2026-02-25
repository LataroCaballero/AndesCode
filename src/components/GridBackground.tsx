export default function GridBackground({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`absolute inset-0 -z-10 ${dark ? 'grid-bg-dark' : 'grid-bg'}`}
      aria-hidden="true"
    />
  );
}
