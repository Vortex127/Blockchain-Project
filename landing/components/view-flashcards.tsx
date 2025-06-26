"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"
import { useWallet } from "@/hooks/useWallet"

interface Flashcard {
  question: string
  answer: string
  owner: string
  timestamp: string
  ipfsCid: string
}

type FlashcardResponse = {
  question: string
  answer: string
  owner: string
  timestamp: bigint
  ipfsCid: string
}

interface PinataRow {
  ipfs_pin_hash: string
  metadata: {
    name: string
    keyvalues?: {
      type?: string
      owner?: string
    }
  }
}

interface IPFSData {
  question: string
  answer: string
  createdAt?: string
}

const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

export function ViewFlashcards() {
  const { contract, account } = useWallet()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadFlashcards = async () => {
    if (!account) {
      setError("Please connect your wallet")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Get the Pinata JWT from environment variable
      const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT
      if (!PINATA_JWT) {
        throw new Error("Pinata JWT not configured")
      }

      let contractCards: FlashcardResponse[] = []
      
      // Try to get cards from contract if available
      if (contract) {
        try {
          const cards = await contract.getFlashcardsByOwner(account)
          if (Array.isArray(cards)) {
            contractCards = cards
          }
        } catch (err) {
          console.warn("Failed to fetch from contract, will try IPFS:", err)
        }
      }

      // Query all flashcards from Pinata
      const pinataResponse = await fetch("https://api.pinata.cloud/data/pinList", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      })

      if (!pinataResponse.ok) {
        throw new Error("Failed to fetch from Pinata")
      }

      const pinataData = await pinataResponse.json()
      
      // Filter for flashcard files by name pattern
      const pinataRows: PinataRow[] = pinataData.rows.filter((row: PinataRow) =>
        row.metadata.name.startsWith('flashcard-') ||
        row.metadata.keyvalues?.type === 'flashcard'
      )

      // Create a map to deduplicate by CID
      const uniqueCards = new Map<string, Flashcard>()

      // First, add contract cards to the map
      for (const card of contractCards) {
        uniqueCards.set(card.ipfsCid, {
          question: card.question,
          answer: card.answer,
          owner: card.owner,
          timestamp: new Date(Number(card.timestamp) * 1000).toLocaleDateString(),
          ipfsCid: card.ipfsCid
        })
      }

      // Then try to fetch and add Pinata cards
      await Promise.all(
        pinataRows.map(async (row) => {
          try {
            const response = await axios.get(`${PINATA_GATEWAY}${row.ipfs_pin_hash}`)
            const ipfsData: IPFSData = response.data

            if (ipfsData.question && ipfsData.answer) {
              uniqueCards.set(row.ipfs_pin_hash, {
                question: ipfsData.question,
                answer: ipfsData.answer,
                owner: row.metadata.keyvalues?.owner || account,
                timestamp: new Date(ipfsData.createdAt || Date.now()).toLocaleDateString(),
                ipfsCid: row.ipfs_pin_hash
              })
            }
          } catch (error) {
            console.warn(`Failed to fetch IPFS content for ${row.ipfs_pin_hash}:`, error)
          }
        })
      )

      setFlashcards(Array.from(uniqueCards.values()))
    } catch (error) {
      console.error('Error loading flashcards:', error)
      setError(error instanceof Error ? error.message : "Failed to load flashcards")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFlashcards()
  }, [contract, account])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!flashcards.length) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold mb-2">No flashcards found</h3>
        <p className="text-gray-400">Create your first flashcard to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flashcards.map((card, index) => (
        <motion.div
          key={card.ipfsCid || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="bg-[#1a1a2e] border-white/10 hover:border-purple-500/50 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="text-lg font-semibold mb-2">Question:</h4>
                <p className="text-gray-300">{card.question}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Answer:</h4>
                <p className="text-gray-300">{card.answer}</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400">Created: {card.timestamp}</p>
                <p className="text-xs text-gray-500 font-mono mt-1 break-all">
                  CID: {card.ipfsCid}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
