// app/layout.js
import { WalletProvider } from '../components/TonConnectProvider';
import './globals.css'; // Ensure you have standard Tailwind setup here

export const metadata = {
  title: 'Quant Rush',
  description: 'High-frequency trading bloodsport.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-green-400 font-mono">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
