// Shared input styling + label/error wrapper for every form backed by real
// validation: border turns danger-red and the message shows below the field
// whenever `error` is set, consistently across every creator-dashboard form.
export function fieldInputClass(hasError?: boolean) {
  return `w-full rounded-xl border ${
    hasError ? "border-danger focus:border-danger" : "border-line focus:border-primary-400"
  } bg-paper px-4 py-3 text-sm outline-none transition-colors`;
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
  // Wrapping the control inside the <label> (rather than a sibling label with
  // no htmlFor/id pairing) gives every field a real implicit label association
  // — required for screen readers and for axe's "form control has a name" check,
  // which a purely-visual label next to an input doesn't satisfy.
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wide text-ink/70">{label}</span>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs leading-5 text-ink/55">{hint}</p>
      )}
    </label>
  );
}
