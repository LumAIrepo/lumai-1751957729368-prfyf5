'use client'

import { useState, useEffect, useMemo } from 'react'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Wallet, Copy, ExternalLink, RefreshCw } from 'lucide-react'

require('@solana/wallet-adapter-react-ui/styles.css')

function WalletInfo() {
  const { connection } = useConnection()
  const { publicKey, connected, disconnect } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchBalance = async () => {
    if (!publicKey || !connected) return
    
    setLoading(true)
    try {
      const balance = await connection.getBalance(publicKey)
      setBalance(balance / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance()
    } else {
      setBalance(null)
    }
  }, [connected, publicKey, connection])

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString())
    }
  }

  const openExplorer = () => {
    if (publicKey) {
      window.open(`https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`, '_blank')
    }
  }

  if (!connected || !publicKey) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-purple-400" />
          </div>
          <CardTitle className="text-white">Connect Your Wallet</CardTitle>
          <CardDescription className="text-gray-400">
            Connect your Solana wallet to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !font-medium" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Wallet Connected</CardTitle>
              <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
                Connected
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">Address</label>
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-3">
            <code className="text-sm text-white flex-1 truncate">
              {publicKey.toString()}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyAddress}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={openExplorer}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-400">Balance</label>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchBalance}
              disabled={loading}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">
              {loading ? (
                <div className="animate-pulse bg-gray-700 h-8 w-24 rounded"></div>
              ) : (
                `${balance?.toFixed(4) || '0.0000'} SOL`
              )}
            </div>
            <div className="text-sm text-gray-400 mt-1">Devnet</div>
          </div>
        </div>

        <Separator className="bg-gray-800" />

        <Button
          onClick={disconnect}
          variant="outline"
          className="w-full border-red-600/30 text-red-400 hover:bg-red-600/10 hover:text-red-300"
        >
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  )
}

function WalletConnectionProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
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

export default function Page() {
  return (
    <WalletConnectionProvider>
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Solana Wallet Connect</h1>
            <p className="text-gray-400 text-lg">Connect your wallet to interact with the Solana blockchain</p>
          </div>
          
          <WalletInfo />
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Connected to Solana Devnet • Supports Phantom, Solflare, and Torus wallets
            </p>
          </div>
        </div>
      </div>
    </WalletConnectionProvider>
  )
}