"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Brain, Plus, Library } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flashcards } from "./flashcards"
import { Deck } from "./deck"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"flashcards" | "decks">("flashcards")
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0a0a16] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-white/10 pb-4">
          <Button
            variant={activeTab === "flashcards" ? "default" : "ghost"}
            onClick={() => setActiveTab("flashcards")}
            className="space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Flashcard</span>
          </Button>
          <Button
            variant={activeTab === "decks" ? "default" : "ghost"}
            onClick={() => setActiveTab("decks")}
            className="space-x-2"
          >
            <Library className="h-4 w-4" />
            <span>Create Deck</span>
          </Button>
        </div>

        {/* Content Area */}
        <div className="mt-8">
          {activeTab === "flashcards" ? <Flashcards /> : <Deck />}
        </div>
      </div>
    </div>
  )
}