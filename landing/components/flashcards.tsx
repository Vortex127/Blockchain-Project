"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function Flashcards() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
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
            name: `flashcard-${Date.now()}`,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const flashcardContent = {
        question,
        answer,
        createdAt: new Date().toISOString(),
      }

      const ipfsHash = await uploadToIPFS(flashcardContent)

      // Here you would typically call your smart contract to store the IPFS hash
      // await contract.createFlashcard(ipfsHash)

      toast({
        title: "Success!",
        description: "Flashcard created and stored on IPFS",
      })

      setQuestion("")
      setAnswer("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create flashcard",
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
            disabled={isLoading}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            {isLoading ? "Creating..." : "Create Flashcard"}
          </Button>
        </form>
      </Card>
    </div>
  )
}