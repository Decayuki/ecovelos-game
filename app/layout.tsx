import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import './globals.css'
import './story.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
// Titres éditoriaux de la traversée (preset « folio »).
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', axes: ['opsz'] })

export const metadata: Metadata = {
  title: 'Gestion & Valeur Partenariale - Serious Game',
  description: 'Jeu de simulation pédagogique sur la valeur ajoutée et la valeur partenariale',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
