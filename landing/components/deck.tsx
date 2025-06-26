"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

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

  const uploadToIPFS = async (content: any) => {
    try {
      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: content,
          pinataMetadata: {
            name: `deck-${Date.now()}`,
          },
        }),
      })

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
    setIsLoading(true)

    try {
      const deckContent = {
        name: deckName,
        description,
        flashcards,
        createdAt: new Date().toISOString(),
      }

      const ipfsHash = await uploadToIPFS(deckContent)

      // Here you would typically call your smart contract to store the IPFS hash
      // await contract.createDeck(ipfsHash)

      toast({
        title: "Success!",
        description: "Deck created and stored on IPFS",
      })

      setDeckName("")
      setDescription("")
      setFlashcards([{ question: "", answer: "" }])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create deck",
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
            disabled={isLoading}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            {isLoading ? "Creating..." : "Create Deck"}
          </Button>
        </form>
      </Card>
    </div>
  )
}