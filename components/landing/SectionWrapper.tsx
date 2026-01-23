import React from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const SectionWrapper = ({
  children,
  className,
  id,
}: SectionWrapperProps) => {
  return (
    <section id={id} className={cn("py-20 md:py-32 px-4 md:px-8", className)}>
      <div className="max-w-7xl mx-auto w-full">{children}</div>
    </section>
  );
};
