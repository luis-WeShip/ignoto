"use client";

import { useMemo } from "react";

export type BlobShape =
  | "blob"
  | "circle"
  | "pentagon"
  | "square"
  | "triangle"
  | "drop";
export type BlobMood = "happy" | "sleepy" | "wink" | "smile" | "star";

const SHAPES: Record<BlobShape, string> = {
  blob: "M50 8 C75 8 92 28 92 52 C92 78 72 92 50 92 C28 92 8 76 8 52 C8 28 25 8 50 8 Z",
  circle: "M50 8 a42 42 0 1 0 0.001 0 Z",
  pentagon: "M50 8 L92 38 L76 88 L24 88 L8 38 Z",
  square:
    "M14 14 H86 a8 8 0 0 1 8 8 V86 a8 8 0 0 1 -8 8 H14 a8 8 0 0 1 -8 -8 V22 a8 8 0 0 1 8 -8 Z",
  triangle: "M50 10 L92 86 H8 Z",
  drop: "M50 8 C72 28 92 48 92 66 C92 82 74 94 50 94 C26 94 8 82 8 66 C8 48 28 28 50 8 Z",
};

interface Props {
  shape?: BlobShape;
  color?: string;
  size?: number;
  mood?: BlobMood;
  className?: string;
}

export function KawaiiBlob({
  shape = "blob",
  color = "var(--primary)",
  size = 64,
  mood = "happy",
  className = "",
}: Props) {
  const eyes = useMemo(() => {
    switch (mood) {
      case "sleepy":
        return (
          <>
            <path
              d="M34 52 q6 6 12 0"
              stroke="#1a1a2e"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M54 52 q6 6 12 0"
              stroke="#1a1a2e"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
      case "wink":
        return (
          <>
            <circle cx="40" cy="54" r="4.5" fill="#1a1a2e" />
            <path
              d="M54 54 q6 -4 12 0"
              stroke="#1a1a2e"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
      case "star":
        return (
          <>
            <text x="36" y="60" fontSize="14" fill="#1a1a2e" textAnchor="middle">
              ✦
            </text>
            <text x="64" y="60" fontSize="14" fill="#1a1a2e" textAnchor="middle">
              ✦
            </text>
          </>
        );
      case "smile":
        return (
          <>
            <circle cx="40" cy="52" r="3.5" fill="#1a1a2e" />
            <circle cx="60" cy="52" r="3.5" fill="#1a1a2e" />
          </>
        );
      default:
        return (
          <>
            <ellipse cx="40" cy="54" rx="4.5" ry="5.5" fill="#1a1a2e" />
            <ellipse cx="60" cy="54" rx="4.5" ry="5.5" fill="#1a1a2e" />
            <circle cx="41.5" cy="52" r="1.4" fill="#fff" />
            <circle cx="61.5" cy="52" r="1.4" fill="#fff" />
          </>
        );
    }
  }, [mood]);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <path d={SHAPES[shape]} fill={color} />
      {eyes}
      <path
        d="M44 66 q6 6 12 0"
        stroke="#1a1a2e"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="32" cy="64" r="3" fill="#ffffff" opacity="0.35" />
      <circle cx="68" cy="64" r="3" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}
