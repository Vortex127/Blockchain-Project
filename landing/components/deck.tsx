"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/hooks/useWallet"

interface FlashcardInput {
  question: string
  answer: string
}

export function Deck() {
  const [deckName, setDeckName] = useState("")
  const [description, setDescription] = useState("")
  const [flashcards, setFlashcards] = useState<FlashcardInput[]>([
    { question: "", answer: "" },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { contract, account, isConnected } = useWallet()

  const uploadToIPFS = async (content: any, name: string) => {
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
            name: name,
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

  const addFlashcard = () => {
    setFlashcards([...flashcards, { question: "", answer: "" }])
  }

  const removeFlashcard = (index: number) => {
    if (flashcards.length > 1) {
      setFlashcards(flashcards.filter((_, i) => i !== index))
    }
  }

  const updateFlashcard = (index: number, field: keyof FlashcardInput, value: string) => {
    const updatedFlashcards = flashcards.map((card, i) => {
      if (i === index) {
        return { ...card, [field]: value }
      }
      return card
    })
    setFlashcards(updatedFlashcards)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !contract) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create decks",
        variant: "destructive",
      })
      return
    }

    // Validate flashcards
    const validFlashcards = flashcards.filter(card => card.question.trim() && card.answer.trim())
    if (validFlashcards.length === 0) {
      toast({
        title: "No valid flashcards",
        description: "Please add at least one flashcard with both question and answer",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Upload individual flashcards to IPFS and store on-chain
      toast({
        title: "Creating flashcards...",
        description: `Uploading ${validFlashcards.length} flashcards to IPFS`,
      })

      const flashcardCids: string[] = []
      
      for (let i = 0; i < validFlashcards.length; i++) {
        const flashcard = validFlashcards[i]
        
        // Upload individual flashcard to IPFS
        const flashcardContent = {
          question: flashcard.question,
          answer: flashcard.answer,
          createdAt: new Date().toISOString(),
          creator: account
        }
        
        const flashcardCid = await uploadToIPFS(flashcardContent, `flashcard-${Date.now()}-${i}`)
        flashcardCids.push(flashcardCid)
        
        // Store flashcard on blockchain
        const tx = await contract.addFlashcard(flashcard.question, flashcard.answer, flashcardCid)
        await tx.wait()
        
        toast({
          title: `Flashcard ${i + 1}/${validFlashcards.length} created`,
          description: "Stored on IPFS and blockchain",
        })
      }

      // Step 2: Create deck metadata and upload to IPFS
      toast({
        title: "Creating deck...",
        description: "Bundling flashcards into deck",
      })

      const deckContent = {
        name: deckName,
        description,
        flashcards: validFlashcards,
        flashcardCids,
        createdAt: new Date().toISOString(),
        creator: account
      }

      const deckCid = await uploadToIPFS(deckContent, `deck-${Date.now()}`)

      // Step 3: Store deck on blockchain (this will trigger MetaMask)
      toast({
        title: "Confirm Transaction",
        description: "Please approve the transaction in MetaMask to create your deck",
      })

      try {
        const tx = await contract.createDeck(deckName, description, flashcardCids, deckCid)
        
        toast({
          title: "Transaction Submitted",
          description: "Waiting for blockchain confirmation...",
        })

        await tx.wait()
      } catch (contractError) {
        console.warn("Contract createDeck not available, storing deck metadata only on IPFS")
        toast({
          title: "Note",
          description: "Deck created on IPFS. Contract needs to be updated for full blockchain storage.",
        })
      }

      toast({
        title: "Success!",
        description: `Deck "${deckName}" created with ${validFlashcards.length} flashcards!`,
      })

      setDeckName("")
      setDescription("")
      setFlashcards([{ question: "", answer: "" }])
    } catch (error: any) {
      console.error("Error creating deck:", error)
      
      let errorMessage = "Failed to create deck"
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
    <div className="max-w-3xl mx-auto">
      <Card className="p-6 bg-[#0f0f1a] border-white/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Deck Name</label>
            <Input
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Enter deck name"
              className="bg-[#1a1a2e] border-white/10"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter deck description"
              className="bg-[#1a1a2e] border-white/10"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Flashcards</h3>
              <Button
                type="button"
                onClick={addFlashcard}
                variant="outline"
                size="sm"
                className="space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Flashcard</span>
              </Button>
            </div>

            {flashcards.map((flashcard, index) => (
              <Card key={index} className="p-4 bg-[#1a1a2e] border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium">Flashcard {index + 1}</span>
                  {flashcards.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFlashcard(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Question</label>
                    <Input
                      value={flashcard.question}
                      onChange={(e) => updateFlashcard(index, "question", e.target.value)}
                      placeholder="Enter question"
                      className="bg-[#0f0f1a] border-white/10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Answer</label>
                    <Textarea
                      value={flashcard.answer}
                      onChange={(e) => updateFlashcard(index, "answer", e.target.value)}
                      placeholder="Enter answer"
                      className="bg-[#0f0f1a] border-white/10"
                      required
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isConnected}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50"
          >
            {!isConnected 
              ? "Connect Wallet First" 
              : isLoading 
                ? "Creating Deck..." 
                : "Create Deck"
            }
          </Button>
          
          {!isConnected && (
            <p className="text-center text-sm text-white/60 mt-2">
              Please connect your wallet to create decks on-chain
            </p>
          )}
        </form>
      </Card>
    </div>
  )
}