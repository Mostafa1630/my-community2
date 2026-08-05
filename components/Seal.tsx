// Renders the real Nadi Community logo (icon + wordmark baked into one
// image — the client only supplied the combined lockup, not a separate
// icon-only mark) sized by height, width following its own aspect ratio.
// Every call site already passes a `size` used as a square icon slot from
// the old placeholder-badge version; kept the same prop so no caller needed
// touching, just scaled the image to that height instead of a square.
export default function Seal({ size = 40 }: { size?: number; label?: string; tone?: "primary" | "accent" }) {
  return (
    <img
      src="/images/nadi-logo.png"
      alt="Nadi Community"
      style={{ height: size, width: "auto" }}
      className="shrink-0 object-contain"
    />
  );
}
