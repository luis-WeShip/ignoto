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
        "rounded-3xl border-4 border-yellow-300 bg-gradient-to-br from-amber-50 via-white to-sky-50",
        "p-5 shadow-lg my-3",
        status === "complete" && "border-green-300 bg-green-50/40",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        {emoji ? <span className="text-3xl">{emoji}</span> : null}
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}
