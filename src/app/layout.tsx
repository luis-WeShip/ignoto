import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ignoto · Aprende jugando",
  description: "Tutor con UI generativa para que los niños aprendan jugando.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
