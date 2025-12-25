import './globals.css'

export const metadata = {
  title: 'FX Lot Calculator',
  description: 'Pro FX Position Size Calculator',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
