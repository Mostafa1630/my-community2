import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
      <table className="w-full min-w-[640px] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-line bg-ink/[0.02] text-start text-xs uppercase tracking-wide text-ink/65">
        {children}
      </tr>
    </thead>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 text-start font-medium">{children}</th>;
}

export function Td({
  children,
  className = "",
  dir
}: {
  children: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <td dir={dir} className={`whitespace-nowrap px-4 py-3 align-middle text-ink/80 ${className}`}>
      {children}
    </td>
  );
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="border-b border-line last:border-0 hover:bg-primary-50/40">{children}</tr>;
}
