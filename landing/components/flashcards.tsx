"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/hooks/useWallet"

export function Flashcards() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { contract, account, isConnected } = useWallet()

  const uploadToIPFS = async (content: any) => {
    try {
      if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
        throw new Error('Pinata JWT token not configured')
      }

      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: content,
          pinataMetadata: {
            name: `flashcard-${Date.now()}`,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to upload to IPFS: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      return data.IpfsHash
    } catch (error) {
      console.error("Error uploading to IPFS:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !contract) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create flashcards",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Upload to IPFS
      const flashcardContent = {
        question,
        answer,
        createdAt: new Date().toISOString(),
        creator: account
      }

      toast({
        title: "Uploading to IPFS...",
        description: "Please wait while we store your flashcard on IPFS",
      })

      const ipfsHash = await uploadToIPFS(flashcardContent)

      // Step 2: Store IPFS hash on blockchain (this will trigger MetaMask)
      toast({
        title: "Confirm Transaction",
        description: "Please approve the transaction in MetaMask to store your flashcard on-chain",
      })

      const tx = await contract.addFlashcard(question, answer, ipfsHash)
      
      toast({
        title: "Transaction Submitted",
        description: "Waiting for blockchain confirmation...",
      })

      // Wait for transaction confirmation
      await tx.wait()

      toast({
        title: "Success!",
        description: `Flashcard created successfully! IPFS: ${ipfsHash}`,
      })

      setQuestion("")
      setAnswer("")
    } catch (error: any) {
      console.error("Error creating flashcard:", error)
      
      let errorMessage = "Failed to create flashcard"
      if (error.code === 4001) {
        errorMessage = "Transaction was rejected by user"
      } else if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas fees"
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6 bg-[#0f0f1a] border-white/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Question</label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              className="bg-[#1a1a2e] border-white/10"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Answer</label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter the answer"
              className="bg-[#1a1a2e] border-white/10 min-h-[100px]"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isConnected}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50"
          >
            {!isConnected 
              ? "Connect Wallet First" 
              : isLoading 
                ? "Creating..." 
                : "Create Flashcard"
            }
          </Button>
          
          {!isConnected && (
            <p className="text-center text-sm text-white/60 mt-2">
              Please connect your wallet to create flashcards on-chain
            </p>
          )}
        </form>
      </Card>
    </div>
  )
}