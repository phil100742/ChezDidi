import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Chez Didi',
  description: 'Pâtisseries fines & sur mesure',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
