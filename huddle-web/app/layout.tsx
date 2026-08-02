import './globals.css';
import { Providers } from './providers';
import ClientLayout from './components/ClientLayout';

export const metadata = {
  title: 'Huddle',
  description: 'A modern community and event platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
