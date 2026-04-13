import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { RoleProvider } from "@/components/providers/role-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Hubera VD — Vibe Design Registry",
  description:
    "Browse, fork, and publish design systems. Install any system (or a single component) straight into your project via Claude Code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("octopus-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
        style={
          {
            "--app-font": "var(--font-space-grotesk)",
          } as React.CSSProperties
        }
      >
        <ThemeProvider>
          <RoleProvider>{children}</RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
