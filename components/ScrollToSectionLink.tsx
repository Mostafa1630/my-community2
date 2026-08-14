"use client";

import Link from "next/link";
import type { ReactNode, MouseEvent } from "react";

export default function ScrollToSectionLink({
  href,
  sectionId,
  className,
  children,
  onClick
}: {
  href: string;
  sectionId: string;
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const basePath = href.split("#")[0];

  return (
    <Link
      href={basePath}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        const onSamePage =
          window.location.pathname === new URL(basePath, window.location.origin).pathname;

        if (onSamePage) {
          event.preventDefault();
          document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
    >
      {children}
    </Link>
  );
}
