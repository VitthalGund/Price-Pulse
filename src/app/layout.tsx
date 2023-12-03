import Navbar from '@/components/Navbar'
import './globals.css'
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'PricePulse',
  abstract: "PricePulse is your one-stop solution for tracking live prices of your favorite products across multiple e-commerce platforms. Stay updated with real-time price information and make informed purchasing decisions.",
  keywords: "Price Tracking, E-commerce, Live Prices, Price Alerts, Cost Comparison",
  authors: [{ name: "Vitthal Gund", url: "https://github.com/VitthalGund" }],
  applicationName: "PricePulse  ",
  category: "",
  description: 'Our mission is to revolutionize the way people shop online. By providing live price tracking across multiple platforms, we aim to create a transparent and competitive e-commerce environment that benefits both consumers and retailers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="max-w-10xl mx-auto">
          <Navbar />
          {children}
        </main>
      </body>
    </html>
  )
}
