// Shared input styling + label/error wrapper for every form backed by real
// validation: border turns danger-red and the message shows below the field
// whenever `error` is set, consistently across every creator-dashboard form.
export function fieldInputClass(hasError?: boolean) {
  return `w-full rounded-xl border ${
    hasError ? "border-danger focus:border-danger" : "border-line focus:border-primary-400"
  } bg-paper px-3.5 py-2.5 text-sm outline-none`;
}

export default function FormField({
  label,
  error,
  hint,
  children
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink/60">{label}</label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>
      )}
    </div>
  );
}
