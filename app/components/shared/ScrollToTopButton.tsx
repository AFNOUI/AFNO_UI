"use client";

import { ArrowUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

export interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
  positionClassName?: string;
}

const DEFAULT_THRESHOLD = 400;
const DEFAULT_POSITION = "bottom-6 right-6";

export function ScrollToTopButton({
  className,
  threshold = DEFAULT_THRESHOLD,
  positionClassName = DEFAULT_POSITION,
}: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Button
    size="icon"
    type="button"
      variant="default"
      aria-label="Scroll to top"
      onClick={scrollToTop}
      className={cn(
        "fixed z-50 size-10 rounded-full border-0 p-0",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "shadow-[0_6px_20px_hsl(var(--primary)/0.45),0_4px_12px_rgba(0,0,0,0.15)]",
        "dark:shadow-[0_6px_24px_hsl(var(--primary)/0.35),0_4px_16px_rgba(0,0,0,0.45)]",
        "hover:shadow-[0_8px_24px_hsl(var(--primary)/0.5),0_6px_14px_rgba(0,0,0,0.18)]",
        "transition-[opacity,transform,box-shadow] duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        positionClassName,
        visible
          ? "translate-y-0 scale-100 opacity-100 pointer-events-auto"
          : "translate-y-3 scale-90 opacity-0 pointer-events-none",
        className,
      )}
    >
      <ArrowUp className="size-7" strokeWidth={2.5} aria-hidden />
    </Button>
  );
}
