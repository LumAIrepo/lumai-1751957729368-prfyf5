'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, Copy, ExternalLink, LogOut, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface WalletConnectButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showBalance?: boolean
  showAddress?: boolean
}

export default function WalletConnectButton({
  className = '',
  variant = 'default',
  size = 'default',
  showBalance = true,
  showAddress = true
}: WalletConnectButtonProps) {
  const { 
    wallet, 
    publicKey, 
    connected, 
    connecting, 
    disconnecting,
    connect, 
    disconnect, 
    select,
    wallets
  } = useWallet()

  const [balance, setBalance] = useState<number | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    if (connected && publicKey && showBalance) {
      fetchBalance()
    }
  }, [connected, publicKey, showBalance])

  const fetchBalance = async () => {
    if (!publicKey) return
    
    try {
      const response = await fetch(`https://api.mainnet-beta.solana.com`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [publicKey.toString()]
        })
      })
      
      const data = await response.json()
      if (data.result) {
        setBalance(data.result.value / 1000000000) // Convert lamports to SOL
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }

  const handleConnect = async () => {
    try {
      if (!wallet) {
        setIsDropdownOpen(true)
        return
      }
      await connect()
      toast.success('Wallet connected successfully!')
    } catch (error) {
      toast.error('Failed to connect wallet')
      console.error('Connection error:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      setBalance(null)
      toast.success('Wallet disconnected')
    } catch (error) {
      toast.error('Failed to disconnect wallet')
      console.error('Disconnection error:', error)
    }
  }

  const handleWalletSelect = async (selectedWallet: any) => {
    try {
      select(selectedWallet.adapter.name)
      setIsDropdownOpen(false)
      await connect()
      toast.success(`Connected to ${selectedWallet.adapter.name}`)
    } catch (error) {
      toast.error(`Failed to connect to ${selectedWallet.adapter.name}`)
      console.error('Wallet selection error:', error)
    }
  }

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString())
      toast.success('Address copied to clipboard!')
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (!connected) {
    return (
      <div className="relative">
        <Button
          onClick={handleConnect}
          disabled={connecting}
          variant={variant}
          size={size}
          className={`${className} ${connecting ? 'opacity-50' : ''}`}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>

        {isDropdownOpen && (
          <Card className="absolute top-full mt-2 w-80 z-50 border-gray-800 bg-gray-900">
            <CardHeader>
              <CardTitle className="text-white">Select Wallet</CardTitle>
              <CardDescription className="text-gray-400">
                Choose a wallet to connect to Solana
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {wallets.filter(wallet => wallet.readyState === 'Installed').length === 0 ? (
                <div className="flex items-center gap-2 p-3 text-amber-400 bg-amber-400/10 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">No wallets detected. Please install a Solana wallet.</span>
                </div>
              ) : (
                wallets
                  .filter(wallet => wallet.readyState === 'Installed')
                  .map((wallet) => (
                    <Button
                      key={wallet.adapter.name}
                      onClick={() => handleWalletSelect(wallet)}
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-gray-800"
                    >
                      <img 
                        src={wallet.adapter.icon} 
                        alt={wallet.adapter.name}
                        className="w-5 h-5 mr-3"
                      />
                      {wallet.adapter.name}
                    </Button>
                  ))
              )}
              <Button
                onClick={() => setIsDropdownOpen(false)}
                variant="outline"
                className="w-full mt-4 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {wallet?.adapter.icon && (
              <img 
                src={wallet.adapter.icon} 
                alt={wallet.adapter.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Connected
                </Badge>
                {wallet && (
                  <span className="text-sm text-gray-400">{wallet.adapter.name}</span>
                )}
              </div>
              {showAddress && publicKey && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono text-gray-300">
                    {formatAddress(publicKey.toString())}
                  </span>
                  <Button
                    onClick={copyAddress}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => window.open(`https://explorer.solana.com/address/${publicKey.toString()}`, '_blank')}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              )}
              {showBalance && balance !== null && (
                <div className="text-sm text-gray-400 mt-1">
                  Balance: {balance.toFixed(4)} SOL
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={handleDisconnect}
            disabled={disconnecting}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}