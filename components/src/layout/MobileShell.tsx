import { ReactNode } from "react";

/**
 * Mobile-first phone-shaped shell. Centers a 480px-wide column on desktop.
 */
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex justify-center bg-background">
      <div
        className="relative w-full max-w-[480px] min-h-dvh bg-background overflow-x-hidden md:my-4 md:rounded-[2.25rem] md:border md:border-white/5 md:shadow-card md:overflow-hidden"
        data-testid="mobile-shell"
      >
        {children}
      </div>
    </div>
  );
}
