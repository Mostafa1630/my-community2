export default function Seal({
  size = 40,
  label,
  tone = "primary"
}: {
  size?: number;
  label: string;
  tone?: "primary" | "accent";
}) {
  const bg = tone === "primary" ? "#0E5B52" : "#D79A3B";
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full text-white"
      style={{ width: size, height: size, background: bg }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        style={{ padding: 2 }}
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="2"
          strokeDasharray="4 6"
        />
      </svg>
      <span
        className="font-display font-bold"
        style={{ fontSize: size * 0.4, lineHeight: 1 }}
      >
        {label}
      </span>
    </span>
  );
}
