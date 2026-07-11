import { WalletProvider } from '../components/TonConnectProvider';
import './globals.css';

export const metadata = {
  title: 'Quant Rush',
  description: 'High-frequency trading bloodsport.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-green-400 font-mono overflow-hidden">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
