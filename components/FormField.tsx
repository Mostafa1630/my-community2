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
  // Wrapping the control inside the <label> (rather than a sibling label with
  // no htmlFor/id pairing) gives every field a real implicit label association
  // — required for screen readers and for axe's "form control has a name" check,
  // which a purely-visual label next to an input doesn't satisfy.
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink/65">{label}</span>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-ink/65">{hint}</p>
      )}
    </label>
  );
}
