'use client';                
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { usePathname } from 'next/navigation';
import RoleSwitcher from './components/RoleSwitcher';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <html lang="en">
      <body className={`${inter.className} relative min-h-screen bg-slate-950 text-gray-100 antialiased`}>
        <AuthProvider>
          {isHome && <Navbar />}          
          <main className="relative z-10">{children}</main>
          <RoleSwitcher />
        </AuthProvider>
      </body>
    </html>
  );
}