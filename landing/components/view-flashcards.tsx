"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Edit, 
  Trash2, 
  Save, 
  X, 
  AlertTriangle,
  Calendar,
  Hash
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
  creator?: string
}

const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

export function ViewFlashcards() {
  const { contract, account, isLoading: walletLoading } = useWallet()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)
  const [editQuestion, setEditQuestion] = useState("")
  const [editAnswer, setEditAnswer] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<Flashcard | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const loadFlashcards = useCallback(async () => {
    console.log("loadFlashcards called", { account, contract: !!contract, walletLoading })
    
    if (walletLoading) {
      console.log("Wallet is still loading, skipping...")
      return
    }

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
        console.error("NEXT_PUBLIC_PINATA_JWT environment variable not set")
        setError("Pinata JWT not configured. Please set NEXT_PUBLIC_PINATA_JWT environment variable.")
        return
      }

      console.log("Environment check:", {
        hasPinataJWT: !!PINATA_JWT,
        hasContractAddress: !!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        contractInstance: !!contract
      })

      let contractCards: FlashcardResponse[] = []
      
      // Try to get cards from contract if available
      if (contract) {
        try {
          console.log("Fetching flashcards from contract...")
          
          // Add a timeout to the contract call
          const contractPromise = contract.getFlashcardsByOwner(account)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Contract call timeout')), 10000)
          )
          
          const cards = await Promise.race([contractPromise, timeoutPromise]) as any[]
          
          if (Array.isArray(cards)) {
            contractCards = cards
            console.log(`Found ${cards.length} flashcards from contract`)
          } else {
            console.warn("Contract returned non-array result:", cards)
          }
        } catch (err) {
          console.warn("Failed to fetch from contract, will try IPFS:", err)
          // Continue with IPFS even if contract fails
        }
      } else {
        console.log("No contract available, skipping contract fetch")
      }

      // Query all flashcards from Pinata with pagination
      console.log("Fetching flashcards from Pinata...")
      const pinataResponse = await fetch("https://api.pinata.cloud/data/pinList?pageLimit=1000&includeCount=false", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      })

      if (!pinataResponse.ok) {
        throw new Error(`Failed to fetch from Pinata: ${pinataResponse.status} ${pinataResponse.statusText}`)
      }

      const pinataData = await pinataResponse.json()
      console.log(`Found ${pinataData.rows.length} total files in Pinata`)
      
      // Get all rows for initial processing - we'll filter by content later
      const pinataRows: PinataRow[] = pinataData.rows
      console.log(`Processing ${pinataRows.length} files to check for flashcards`)

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
      let successCount = 0
      let flashcardCount = 0
      
      await Promise.all(
        pinataRows.map(async (row) => {
          try {
            const response = await axios.get(`${PINATA_GATEWAY}${row.ipfs_pin_hash}`, {
              timeout: 5000 // 5 second timeout
            })
            const ipfsData: IPFSData = response.data
            successCount++

            // Check if this looks like a flashcard (has question and answer)
            if (ipfsData.question && ipfsData.answer) {
              flashcardCount++
              uniqueCards.set(row.ipfs_pin_hash, {
                question: ipfsData.question,
                answer: ipfsData.answer,
                owner: ipfsData.creator || row.metadata.keyvalues?.owner || account,
                timestamp: new Date(ipfsData.createdAt || Date.now()).toLocaleDateString(),
                ipfsCid: row.ipfs_pin_hash
              })
              console.log(`Found flashcard: ${ipfsData.question.substring(0, 50)}...`)
            }
          } catch (error) {
            // Only log actual errors, not every failed request
            if (error.code !== 'ECONNABORTED' && error.response?.status !== 404) {
              console.warn(`Failed to fetch IPFS content for ${row.ipfs_pin_hash}:`, error.message)
            }
          }
        })
      )
      
      console.log(`Successfully fetched ${successCount} files, found ${flashcardCount} flashcards`)

      setFlashcards(Array.from(uniqueCards.values()))
    } catch (error) {
      console.error('Error loading flashcards:', error)
      setError(error instanceof Error ? error.message : "Failed to load flashcards")
    } finally {
      setIsLoading(false)
    }
  }, [contract, account, walletLoading])

  useEffect(() => {
    // Only call loadFlashcards when wallet is not loading
    if (!walletLoading) {
      console.log("useEffect triggered, calling loadFlashcards")
      loadFlashcards()
    }
  }, [loadFlashcards, walletLoading])

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card)
    setEditQuestion(card.question)
    setEditAnswer(card.answer)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingCard || !account) return

    setIsSaving(true)
    try {
      // Upload updated content to IPFS
      const updatedContent = {
        question: editQuestion,
        answer: editAnswer,
        createdAt: new Date().toISOString(),
        creator: account,
        originalCid: editingCard.ipfsCid // Keep reference to original
      }

      const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT
      if (!PINATA_JWT) {
        throw new Error('Pinata JWT not configured')
      }

      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataContent: updatedContent,
          pinataMetadata: {
            name: `flashcard-updated-${Date.now()}`,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update flashcard on IPFS')
      }

      const data = await response.json()
      
      // Update local state
      setFlashcards(prev => prev.map(card => 
        card.ipfsCid === editingCard.ipfsCid 
          ? { ...card, question: editQuestion, answer: editAnswer, ipfsCid: data.IpfsHash }
          : card
      ))

      toast({
        title: "Success!",
        description: "Flashcard updated successfully",
      })

      setIsEditDialogOpen(false)
      setEditingCard(null)
    } catch (error) {
      console.error('Error updating flashcard:', error)
      toast({
        title: "Error",
        description: "Failed to update flashcard",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (card: Flashcard) => {
    setCardToDelete(card)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!cardToDelete) return

    setIsDeleting(true)
    try {
      const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT
      if (!PINATA_JWT) {
        throw new Error('Pinata JWT not configured')
      }

      // Unpin from IPFS (optional - keeps it on IPFS but removes from your pins)
      await fetch(`https://api.pinata.cloud/pinning/unpin/${cardToDelete.ipfsCid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      })

      // Remove from local state
      setFlashcards(prev => prev.filter(card => card.ipfsCid !== cardToDelete.ipfsCid))

      toast({
        title: "Success!",
        description: "Flashcard deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      setCardToDelete(null)
    } catch (error) {
      console.error('Error deleting flashcard:', error)
      toast({
        title: "Error", 
        description: "Failed to delete flashcard",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (walletLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white/70">
            {walletLoading ? "Loading wallet..." : "Loading flashcards..."}
          </p>
        </div>
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcards.map((card, index) => (
          <motion.div
            key={card.ipfsCid || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Card className="bg-[#1a1a2e] border-white/10 hover:border-purple-500/50 transition-all duration-300 group overflow-hidden">
              <CardContent className="p-6 space-y-4">
                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(card)}
                    className="h-8 w-8 p-0 hover:bg-blue-500/20 hover:text-blue-400"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(card)}
                    className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2 text-purple-300">Question:</h4>
                  <p className="text-gray-300">{card.question}</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-green-300">Answer:</h4>
                  <p className="text-gray-300">{card.answer}</p>
                </div>
                
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {card.timestamp}
                    </div>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                      Your Card
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Hash className="h-3 w-3 mr-1" />
                    <span className="font-mono truncate">CID: {card.ipfsCid}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1a1a2e] border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-300">Edit Flashcard</DialogTitle>
            <DialogDescription className="text-gray-400">
              Make changes to your flashcard. This will create a new version on IPFS.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Question</label>
              <Input
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                className="bg-[#0f0f1a] border-white/10 text-white mt-1"
                placeholder="Enter question"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300">Answer</label>
              <Textarea
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                className="bg-[#0f0f1a] border-white/10 text-white mt-1"
                placeholder="Enter answer"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-white/20"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving || !editQuestion.trim() || !editAnswer.trim()}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {isSaving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#1a1a2e] border-red-500/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Delete Flashcard
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this flashcard? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {cardToDelete && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <strong>Question:</strong> {cardToDelete.question}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              variant="destructive"
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
