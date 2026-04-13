import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Monitoreo Call Center',
  description: 'Solución analítica para el monitoreo integral de KPIs de call center.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Monitoreo CC',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#dc2626',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">{children}</body>
    </html>
  );
}
