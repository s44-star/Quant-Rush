'use client';
import { TonConnectUIProvider, TonConnectButton } from '@tonconnect/ui-react';

export function WalletProvider({ children }) {
  return (
    <TonConnectUIProvider manifestUrl="https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}

export function WalletConnect() {
  return <TonConnectButton />;
}
