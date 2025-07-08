'use client'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  SolletWalletAdapter,
  MathWalletAdapter,
  TokenPocketWalletAdapter,
  CoinbaseWalletAdapter,
  SlopeWalletAdapter,
  SafePalWalletAdapter,
  TrustWalletAdapter,
  BackpackWalletAdapter,
  GlowWalletAdapter,
  ExodusWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  BitKeepWalletAdapter,
  WalletConnectWalletAdapter,
  UnsafeBurnerWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo, ReactNode } from 'react'

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css')

interface WalletContextProviderProps {
  children: ReactNode
}

export function WalletContextProvider({ children }: WalletContextProviderProps) {
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), [])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new GlowWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter(),
      new MathWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new SlopeWalletAdapter(),
      new SafePalWalletAdapter(),
      new TrustWalletAdapter(),
      new ExodusWalletAdapter(),
      new CloverWalletAdapter(),
      new Coin98WalletAdapter(),
      new BitKeepWalletAdapter(),
      new WalletConnectWalletAdapter({
        network: 'mainnet-beta',
        options: {
          projectId: 'your-project-id', // Replace with your WalletConnect project ID
        },
      }),
      new UnsafeBurnerWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}