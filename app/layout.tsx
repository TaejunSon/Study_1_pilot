import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/client";
import { en } from "@/data/i18n/en";

export const metadata: Metadata = {
  title: en.studyName,
  description: "Expert gesture elicitation study",
  robots: { index: false, follow: false },
};

/**
 * The page is pre-rendered in English (the default locale) and the stored language preference is applied on
 * hydration, so `lang` starts at "en" and LocaleProvider corrects it.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
