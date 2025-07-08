'use client'

import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useCallback, useEffect, useState } from 'react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

interface WalletState {
  connected: boolean
  connecting: boolean
  disconnecting: boolean
  publicKey: PublicKey | null
  balance: number | null
  address: string | null
}

interface UseWalletReturn extends WalletState {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refreshBalance: () => Promise<void>
}

const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com'

export function useWallet(): UseWalletReturn {
  const {
    wallet,
    publicKey,
    connected,
    connecting,
    disconnecting,
    connect: solanaConnect,
    disconnect: solanaDisconnect,
  } = useSolanaWallet()

  const [balance, setBalance] = useState<number | null>(null)
  const [connection] = useState(() => new Connection(RPC_ENDPOINT))

  const refreshBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setBalance(null)
      return
    }

    try {
      const lamports = await connection.getBalance(publicKey)
      setBalance(lamports / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      setBalance(null)
    }
  }, [publicKey, connected, connection])

  const connect = useCallback(async () => {
    try {
      await solanaConnect()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }, [solanaConnect])

  const disconnect = useCallback(async () => {
    try {
      await solanaDisconnect()
      setBalance(null)
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }, [solanaDisconnect])

  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance()
    }
  }, [connected, publicKey, refreshBalance])

  return {
    connected,
    connecting,
    disconnecting,
    publicKey,
    balance,
    address: publicKey?.toBase58() || null,
    connect,
    disconnect,
    refreshBalance,
  }
}