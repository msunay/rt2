import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/redux/provider";

export const metadata: Metadata = {
  title: "Real Time Trivia",
  description: "Livestreaming quiz platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav>Real Time Trivia</nav>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}