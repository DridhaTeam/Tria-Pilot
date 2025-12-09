import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
// import Navigation from '@/components/layout/Navigation' // Replaced by new Header
import Header from '@/components/Header'
import { ReactQueryProvider } from '@/lib/react-query/provider'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { Playfair_Display, Inter } from 'next/font/google'
import { ReactLenis } from '@/lib/lenis' // We need to create this file

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'TRIA - AI Fashion Try-On Marketplace',
  description: 'AI-powered platform connecting influencers and brands with virtual try-on capabilities.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased bg-cream text-charcoal`}>
        <ReactQueryProvider>
          <ReactLenis>
            {/* <Navigation /> */}
            <Header />
            {children}
            <Toaster />
          </ReactLenis>
        </ReactQueryProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
