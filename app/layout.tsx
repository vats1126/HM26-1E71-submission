import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell/AppShell"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mysuru Janseva — Mysuru Civic Reporting",
  description: "Mysuru Janseva — Report civic issues in Mysuru. Track them. Act on them. Verify them. Real-time civic accountability.",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%2316a34a'/><path d='M16 6c-2 0-4 3-4 6 0 3 1.5 5 4 5s4-2 4-5c0-3-2-6-4-6z' fill='white'/><circle cx='16' cy='19' r='1.5' fill='white'/></svg>",
        type: "image/svg+xml",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
