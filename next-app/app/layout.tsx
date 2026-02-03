import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Centro de Nueva Esperanza | Modern Sanctuary",
  description:
    "A calm, welcoming church experience built with accessible design and Supabase-powered content.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="bg-sand text-slate-900">
        <body className="antialiased min-h-screen bg-sand text-slate-900">
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-sand-300/70 bg-sand px-6 py-4">
              <nav className="mx-auto flex max-w-6xl items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-sand-200 shadow-inner" aria-hidden="true" />
                  <div>
                    <p className="text-lg font-serif font-semibold leading-tight">
                      Centro de Nueva Esperanza
                    </p>
                    <p className="text-sm text-slate-700">Bienvenidos • Welcome</p>
                  </div>
                </div>
                <div className="hidden items-center gap-4 text-sm font-medium text-slate-800 sm:flex">
                  <a className="hover:text-slate-950 transition-colors" href="#about">
                    About
                  </a>
                  <a className="hover:text-slate-950 transition-colors" href="#sermons">
                    Sermons
                  </a>
                  <a className="hover:text-slate-950 transition-colors" href="#visit">
                    Visit
                  </a>
                </div>
              </nav>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-sand-300/70 bg-sand px-6 py-6">
              <div className="mx-auto max-w-6xl text-sm text-slate-700">
                <p className="font-serif font-semibold text-slate-900">Centro de Nueva Esperanza</p>
                <p>Esperanza, comunidad, y fe — online and in person.</p>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
