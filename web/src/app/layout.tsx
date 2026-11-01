import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'yizelearn admin',
  description: 'Manage users, courses and payments on yizelearn.',
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
