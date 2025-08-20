import './globals.css'

export const metadata = {
  title: 'DBANGGOTA - Akses Data Anggota',
  description: 'Sistem akses data anggota secara aman dan cepat',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}