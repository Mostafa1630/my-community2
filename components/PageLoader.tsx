import { Loader2 } from "lucide-react";

// Shared loading state for every creator-dashboard view that fetches its data
// on mount — icon-only (no "Loading..." text), centered in the page. The soft
// halo ring behind the spinner (rather than a bare icon floating on white) is
// what was asked for as a "nicer" version of the plain first pass — gives it
// some visual weight without adding a second, separate loading concept.
export default function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary-50" />
        <span className="absolute inset-0 animate-ping rounded-full bg-primary-100 opacity-75 [animation-duration:2s]" />
        <Loader2 size={40} strokeWidth={2.5} className="relative animate-spin text-primary-600" />
      </div>
    </div>
  );
}
