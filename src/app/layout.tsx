import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/lib/hooks"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Growth Strategy Generator",
  description: "Generate personalized marketing growth strategies powered by AI",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
