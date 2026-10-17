import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/Toaster";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Body, display and code faces of the "Arcade night" redesign.
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PyQuest",
  description: "Learn Python and AI engineering through active practice and spaced repetition.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the boot script may set data-theme on
    // <html> before React hydrates, which is the whole point of running it
    // inline — it's the one attribute allowed to differ from the server.
    <html
      lang="en"
      className={`${dmSans.variable} ${bricolage.variable} ${jetbrains.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
