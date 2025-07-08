'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, Wallet, LogOut } from 'lucide-react'
import { useState } from 'react'

interface WalletInfoProps {
  className?: string
}

export default function WalletInfo({ className }: WalletInfoProps) {
  const { publicKey, wallet, disconnect, connected } = useWallet()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const openInExplorer = (address: string) => {
    window.open(`https://explorer.solana.com/address/${address}`, '_blank')
  }

  if (!connected || !publicKey) {
    return (
      <Card className={`w-full max-w-md bg-gray-900 border-gray-800 ${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Wallet className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No wallet connected</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full max-w-md bg-gray-900 border-gray-800 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Wallet className="h-5 w-5" />
          Wallet Connected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Wallet</span>
            <Badge variant="secondary" className="bg-green-900 text-green-300 border-green-700">
              {wallet?.adapter.name || 'Unknown'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <span className="text-sm text-gray-400">Address</span>
            <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
              <code className="text-sm text-white font-mono flex-1">
                {formatAddress(publicKey.toString())}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(publicKey.toString())}
                className="h-8 w-8 p-0 hover:bg-gray-700"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openInExplorer(publicKey.toString())}
                className="h-8 w-8 p-0 hover:bg-gray-700"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-400">Address copied to clipboard!</p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <Button
            onClick={disconnect}
            variant="destructive"
            className="w-full bg-red-900 hover:bg-red-800 text-red-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect Wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}