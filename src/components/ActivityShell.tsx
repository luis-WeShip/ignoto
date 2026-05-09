"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ActivityShellProps {
  title: string;
  emoji?: string;
  children: ReactNode;
  status: "executing" | "complete" | "inProgress";
  className?: string;
}

export function ActivityShell({
  title,
  emoji,
  children,
  status,
  className,
}: ActivityShellProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-border bg-card p-5 shadow-soft my-3 animate-pop-in",
        status === "complete" && "border-mint/60 bg-mint/10",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        {emoji ? <span className="text-3xl">{emoji}</span> : null}
        <h3 className="font-display text-lg font-bold text-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
