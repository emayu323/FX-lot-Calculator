import './globals.css'

export const metadata = {
  title: 'FX ロット計算機',
  description: 'プロ向けFX適正ロット計算ツール',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
