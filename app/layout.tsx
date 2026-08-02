import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

// `||` on purpose: CI passes an empty string when the variable is unset,
// and `??` would not catch it.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'nextjs-cloudflare-static-starter',
    template: '%s | nextjs-cloudflare-static-starter',
  },
  description:
    'A Next.js static export on Cloudflare Pages: MDX content, security headers, keyless CI deploys, Terraform for the platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-zinc-900 antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
