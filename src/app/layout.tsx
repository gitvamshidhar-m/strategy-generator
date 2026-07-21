import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Growth Strategy Generator",
  description: "Generate personalized marketing growth strategies powered by AI",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><link rel="icon" href="/favicon.svg" type="image/svg+xml" /></head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
