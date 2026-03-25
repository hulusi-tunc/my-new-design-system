import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { RoleProvider } from "@/components/providers/role-provider";
import { DSHeader } from "@/components/ds-header";
import { DSSidebar } from "@/components/ds-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Octopus Design System",
  description: "Design tokens and components.",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ "--app-font": "var(--font-geist-sans)" } as React.CSSProperties}>
        <ThemeProvider>
          <RoleProvider>
            <DSHeader />
            <div className="flex pt-12">
              <DSSidebar />
              <main className="flex-1 ml-52">{children}</main>
            </div>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
