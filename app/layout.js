import './globals.css';
import Header from '@/components/Header';
import { Providers } from './providers';

export const metadata = {
  title: 'Smart Appointment Manager',
  description: 'Manage appointments, staff, and queues efficiently',
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>
          <Header />
          <main className=" mx-auto px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}