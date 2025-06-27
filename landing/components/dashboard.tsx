"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Plus, Library, Eye, User, LogOut, ChevronDown, Layers, Sparkles, Zap, Edit, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useWallet } from "@/hooks/useWallet"
import { Flashcards } from "./flashcards"
import { Deck } from "./deck"
import { ViewFlashcards } from "./view-flashcards"
import { ViewDecks } from "./view-decks"

const tabs = [
  {
    id: "view",
    label: "Manage Flashcards",
    icon: Eye,
    gradient: "from-purple-500 to-pink-500",
    description: "View, edit, and delete flashcards"
  },
  {
    id: "view-decks",
    label: "Manage Decks",
    icon: Layers,
    gradient: "from-blue-500 to-cyan-500",
    description: "Organize and edit your decks"
  },
  {
    id: "flashcards",
    label: "Create Flashcard",
    icon: Plus,
    gradient: "from-green-500 to-emerald-500",
    description: "Add new flashcards"
  },
  {
    id: "decks",
    label: "Create Deck",
    icon: Library,
    gradient: "from-orange-500 to-red-500",
    description: "Build new decks from flashcards"
  }
]

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"flashcards" | "decks" | "view" | "view-decks">("view")
  const router = useRouter()
  const { account, disconnectWallet } = useWallet()

  const handleDisconnect = async () => {
    await disconnectWallet()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a16] via-[#1a0a2e] to-[#0a0a16] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-70 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  FlashCard Vault
                </h1>
                <p className="text-white/60 text-sm mt-1">Create, edit, and manage your blockchain flashcards and decks</p>
              </div>
            </div>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-3 hover:bg-white/10 border border-white/20 bg-white/5 backdrop-blur-sm px-4 py-2 h-auto"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a16] animate-pulse"></div>
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium text-white">
                        {account.slice(0, 6)}...{account.slice(-4)}
                      </span>
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Connected
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-white/60" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent 
                align="end" 
                className="w-64 bg-[#1a1a2e]/90 backdrop-blur-md border-white/20 text-white shadow-2xl"
              >
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-white">Wallet Address</p>
                  <p className="text-xs text-white/60 font-mono mt-1 break-all">
                    {account}
                  </p>
                </div>
                
                <DropdownMenuSeparator className="bg-white/20" />
                
                <DropdownMenuItem 
                  onClick={handleDisconnect}
                  className="flex items-center space-x-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer m-1 rounded-md"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Disconnect Wallet</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {tabs.map((tab, index) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`relative cursor-pointer transition-all duration-300 overflow-hidden ${
                        isActive 
                          ? 'bg-white/10 border-white/30 shadow-2xl' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                      onClick={() => setActiveTab(tab.id as any)}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} opacity-20`}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <div className="relative p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${tab.gradient} ${isActive ? 'shadow-lg' : ''}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <Sparkles className="h-4 w-4 text-white/60" />
                            </motion.div>
                          )}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-white/80'}`}>
                            {tab.label}
                          </h3>
                          <p className="text-xs text-white/50 mt-1">{tab.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
                
                {/* Content Header with Action Info */}
                {(activeTab === "view" || activeTab === "view-decks") && (
                  <div className="px-6 pt-6 pb-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          {activeTab === "view" ? "Flashcard Management" : "Deck Management"}
                        </h2>
                        <p className="text-sm text-white/60 mt-1">
                          {activeTab === "view" 
                            ? "Edit questions and answers, or delete flashcards you no longer need"
                            : "Update deck names and descriptions, reorganize your collections"
                          }
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2 text-blue-400">
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </div>
                        <div className="flex items-center space-x-2 text-red-400">
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeTab === "flashcards" ? (
                        <Flashcards />
                      ) : activeTab === "decks" ? (
                        <Deck />
                      ) : activeTab === "view" ? (
                        <ViewFlashcards />
                      ) : (
                        <ViewDecks />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}