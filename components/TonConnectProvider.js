// components/TonConnectProvider.js
'use client';
import { TonConnectUIProvider, TonConnectButton } from '@tonconnect/ui-react';

export function WalletProvider({ children }) {
  return (
    // Note: You must host a tonconnect-manifest.json on your domain later.
    <TonConnectUIProvider manifestUrl="https://your-domain.com/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}

export function WalletConnect() {
  return <TonConnectButton />;
}
