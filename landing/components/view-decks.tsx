"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Calendar, 
  Hash, 
  User,
  Layers,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { useWallet } from "@/hooks/useWallet"

interface DeckFlashcard {
  question: string
  answer: string
}

interface Deck {
  name: string
  description: string
  flashcards: DeckFlashcard[]
  flashcardCids: string[]
  createdAt: string
  creator: string
  deckCid: string
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

const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/'

export function ViewDecks() {
  const { account } = useWallet()
  const [decks, setDecks] = useState<Deck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  
  // Edit/Delete States
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const loadDecks = async () => {
    try {
      setIsLoading(true)
      setError("")

      const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT
      if (!PINATA_JWT) {
        throw new Error("Pinata JWT not configured")
      }

      // Query all files from Pinata
      const pinataResponse = await fetch("https://api.pinata.cloud/data/pinList?pageLimit=1000&includeCount=false", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      })

      if (!pinataResponse.ok) {
        throw new Error("Failed to fetch from Pinata")
      }

      const pinataData = await pinataResponse.json()
      console.log(`Found ${pinataData.rows.length} total files in Pinata`)
      
      const pinataRows: PinataRow[] = pinataData.rows
      const decksList: Deck[] = []
      
      // Simple logic: Only fetch files that start with 'deck-'
      const deckFiles = pinataRows.filter(row => row.metadata?.name?.startsWith('deck'))
      console.log(`Found ${deckFiles.length} deck files out of ${pinataRows.length} total files`)
      
      await Promise.all(
        deckFiles.map(async (row) => {
          try {
            console.log(`Fetching deck: ${row.metadata.name}`)
            
            const response = await axios.get(`${PINATA_GATEWAY}${row.ipfs_pin_hash}`, {
              timeout: 5000
            })
            const deckData = response.data

            // Simple validation: if it has name, description, and flashcards, it's a deck
            if (deckData.name && deckData.description && deckData.flashcards) {
              decksList.push({
                name: deckData.name,
                description: deckData.description,
                flashcards: deckData.flashcards,
                flashcardCids: deckData.flashcardCids || [],
                createdAt: deckData.createdAt || new Date().toISOString(),
                creator: deckData.creator || account || 'Unknown',
                deckCid: row.ipfs_pin_hash
              })
              console.log(`✅ Loaded deck: "${deckData.name}" with ${deckData.flashcards.length} cards`)
            }
          } catch (error) {
            console.log(`❌ Failed to load deck ${row.metadata.name}:`, error instanceof Error ? error.message : 'Unknown error')
          }
        })
      )

      console.log(`Successfully found ${decksList.length} decks`)
      setDecks(decksList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (error) {
      console.error('Error loading decks:', error)
      setError(error instanceof Error ? error.message : "Failed to load decks")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDecks()
  }, [account])

  const openDeck = (deck: Deck) => {
    setSelectedDeck(deck)
    setCurrentCardIndex(0)
    setShowAnswer(false)
  }

  const closeDeck = () => {
    setSelectedDeck(null)
    setCurrentCardIndex(0)
    setShowAnswer(false)
  }

  const nextCard = () => {
    if (selectedDeck && currentCardIndex < selectedDeck.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setShowAnswer(false)
    }
  }

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)
  }

  const handleEdit = (deck: Deck) => {
    setEditingDeck(deck)
    setEditName(deck.name)
    setEditDescription(deck.description)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingDeck || !account) return

    setIsSaving(true)
    try {
      // Upload updated deck to IPFS
      const updatedDeck = {
        name: editName,
        description: editDescription,
        flashcards: editingDeck.flashcards,
        flashcardCids: editingDeck.flashcardCids,
        createdAt: editingDeck.createdAt,
        updatedAt: new Date().toISOString(),
        creator: editingDeck.creator,
        originalCid: editingDeck.deckCid
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
          pinataContent: updatedDeck,
          pinataMetadata: {
            name: `deck-updated-${Date.now()}`,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update deck on IPFS')
      }

      const data = await response.json()
      
      // Update local state
      setDecks(prev => prev.map(deck => 
        deck.deckCid === editingDeck.deckCid 
          ? { ...deck, name: editName, description: editDescription, deckCid: data.IpfsHash }
          : deck
      ))

      // Update selectedDeck if it's the one being edited
      if (selectedDeck?.deckCid === editingDeck.deckCid) {
        setSelectedDeck(prev => prev ? { ...prev, name: editName, description: editDescription, deckCid: data.IpfsHash } : null)
      }

      toast({
        title: "Success!",
        description: "Deck updated successfully",
      })

      setIsEditDialogOpen(false)
      setEditingDeck(null)
    } catch (error) {
      console.error('Error updating deck:', error)
      toast({
        title: "Error",
        description: "Failed to update deck",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = (deck: Deck) => {
    setDeckToDelete(deck)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deckToDelete) return

    setIsDeleting(true)
    try {
      const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT
      if (!PINATA_JWT) {
        throw new Error('Pinata JWT not configured')
      }

      // Unpin from IPFS
      await fetch(`https://api.pinata.cloud/pinning/unpin/${deckToDelete.deckCid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      })

      // Remove from local state
      setDecks(prev => prev.filter(deck => deck.deckCid !== deckToDelete.deckCid))

      // Close deck if it's currently selected
      if (selectedDeck?.deckCid === deckToDelete.deckCid) {
        closeDeck()
      }

      toast({
        title: "Success!",
        description: "Deck deleted successfully",
      })

      setIsDeleteDialogOpen(false)
      setDeckToDelete(null)
    } catch (error) {
      console.error('Error deleting deck:', error)
      toast({
        title: "Error", 
        description: "Failed to delete deck",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

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

  if (!decks.length) {
    return (
      <div className="text-center py-20">
        <Layers className="h-16 w-16 text-white/20 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No decks found</h3>
        <p className="text-gray-400">Create your first deck to get started!</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Deck Grid */}
        <AnimatePresence>
          {!selectedDeck && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {decks.map((deck, index) => (
                <motion.div
                  key={deck.deckCid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="cursor-pointer group relative"
                >
                  <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-white/10 hover:border-purple-500/50 transition-all duration-300 h-full overflow-hidden">
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(deck)
                        }}
                        className="h-8 w-8 p-0 hover:bg-blue-500/20 hover:text-blue-400 bg-black/50 backdrop-blur-sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(deck)
                        }}
                        className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400 bg-black/50 backdrop-blur-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardContent className="p-6 space-y-4 h-full flex flex-col" onClick={() => openDeck(deck)}>
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                            <Layers className="h-3 w-3 mr-1" />
                            {deck.flashcards.length} cards
                          </Badge>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors">
                          {deck.name}
                        </h3>
                        
                        <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                          {deck.description}
                        </p>
                      </div>

                      <div className="flex-grow flex items-center justify-center relative">
                        <div className="relative">
                          {[...Array(Math.min(3, deck.flashcards.length))].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-20 h-28 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-lg border border-white/10"
                              style={{
                                transform: `translate(${i * 4}px, ${i * -2}px) rotate(${i * 2 - 2}deg)`,
                                zIndex: 3 - i,
                              }}
                              animate={{
                                y: [0, -2, 0],
                              }}
                              transition={{
                                duration: 2,
                                delay: i * 0.2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex-shrink-0 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(deck.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {deck.creator.slice(0, 6)}...{deck.creator.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deck Viewer */}
        <AnimatePresence>
          {selectedDeck && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-2xl mx-auto">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-[#1a1a2e]/90 backdrop-blur-sm rounded-t-xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white">{selectedDeck.name}</h2>
                      <p className="text-gray-300 mt-1">{selectedDeck.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(selectedDeck)}
                        className="hover:bg-blue-500/20 hover:text-blue-400"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={closeDeck}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                      Card {currentCardIndex + 1} of {selectedDeck.flashcards.length}
                    </Badge>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Hash className="h-3 w-3" />
                      <span className="font-mono">{selectedDeck.deckCid.slice(0, 8)}...</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  key={currentCardIndex}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#0f0f1a]/90 backdrop-blur-sm border-x border-white/10 min-h-[300px] flex items-center justify-center p-8"
                >
                  <div className="text-center space-y-6 w-full">
                    <div className="min-h-[120px] flex items-center justify-center">
                      <motion.div
                        animate={{ scale: showAnswer ? 0.95 : 1 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-purple-300">
                          {showAnswer ? "Answer" : "Question"}
                        </h3>
                        <p className="text-xl text-white leading-relaxed">
                          {showAnswer 
                            ? selectedDeck.flashcards[currentCardIndex].answer
                            : selectedDeck.flashcards[currentCardIndex].question
                          }
                        </p>
                      </motion.div>
                    </div>
                    
                    <Button
                      onClick={toggleAnswer}
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                    >
                      {showAnswer ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide Answer
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Show Answer
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-[#1a1a2e]/90 backdrop-blur-sm rounded-b-xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={prevCard}
                      disabled={currentCardIndex === 0}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    <div className="flex space-x-2">
                      {selectedDeck.flashcards.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentCardIndex ? 'bg-purple-500' : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={nextCard}
                      disabled={currentCardIndex === selectedDeck.flashcards.length - 1}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1a1a2e] border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-300">Edit Deck</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update your deck's name and description. This will create a new version on IPFS.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Deck Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-[#0f0f1a] border-white/10 text-white mt-1"
                placeholder="Enter deck name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300">Description</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-[#0f0f1a] border-white/10 text-white mt-1"
                placeholder="Enter description"
                rows={3}
              />
            </div>

            {editingDeck && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <p className="text-xs text-gray-400">
                  This deck contains <strong>{editingDeck.flashcards.length} flashcards</strong>
                </p>
              </div>
            )}
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
              disabled={isSaving || !editName.trim() || !editDescription.trim()}
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
              Delete Deck
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this deck? This will permanently remove the deck and all its flashcards. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deckToDelete && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-300">
                <strong>Deck:</strong> {deckToDelete.name}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Flashcards:</strong> {deckToDelete.flashcards.length} cards will be deleted
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
              {isDeleting ? "Deleting..." : "Delete Deck"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 