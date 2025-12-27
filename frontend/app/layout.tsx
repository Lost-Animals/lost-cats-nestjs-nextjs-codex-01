import './globals.css';
import type { Metadata } from 'next';
import { Nav } from '../components/Nav';

export const metadata: Metadata = {
  title: 'LostCats',
  description: 'Lost and found cat listings with safe contact.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body>
        <header className="header">
          <div className="brand">
            LostCats
            <span>Lost & Found cats, safely connected</span>
          </div>
          <Nav />
        </header>
        <main className="container">{children}</main>
        <footer className="footer">LostCats Platform · MVP</footer>
      </body>
    </html>
  );
}
