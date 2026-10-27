import type { Metadata, Viewport } from "next";
import Link from "next/link";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { IBM_Plex_Mono, Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pleck",
  description: "Your family's private archive of everyday moments.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-foreground transition-colors">
        <ClerkProvider
          appearance={{
            theme: shadcn,
            elements: {
              input:
                "border border-input bg-background/60 text-foreground placeholder:text-muted-foreground",
              cardBox: "border border-border/80 bg-card shadow-xl",
              socialButtonsBlockButton:
                "border-border bg-background/40 text-foreground hover:bg-muted",
              userButtonPopoverCard: {
                background: "color-mix(in srgb, var(--card) 20%, transparent)",
                backdropFilter: "blur(24px)",
                border:
                  "1px solid color-mix(in srgb, var(--border) 90%, transparent)",
                borderRadius: "1rem",
                boxShadow: "0 18px 40px -16px rgba(0, 0, 0, 0.45)",
              },
              userButtonPopoverMain: {
                background: "transparent",
                boxShadow: "none",
              },
              userButtonPopoverActionButton:
                "text-foreground hover:bg-foreground/8",
              userButtonPopoverFooter: {
                background: "transparent",
                borderTop:
                  "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
              },
            },
          }}
        >
          <header className="mx-auto flex h-16 w-full items-center justify-between px-3.5 sm:px-6 mb-4">
            <Link href="/" className="pleck-logo">
              pleck
            </Link>
            <div className="flex items-center gap-3">
              <Show when="signed-out">
                <SignInButton>
                  <button className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="rounded-full bg-primary px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
