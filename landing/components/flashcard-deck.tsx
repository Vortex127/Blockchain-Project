"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface FlashcardDeckProps {
  flashcards: { question: string; answer: string }[]
  activeCard: number
  setActiveCard: (index: number) => void
}

export function FlashcardDeck({ flashcards, activeCard, setActiveCard }: FlashcardDeckProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleCardClick = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="relative w-full max-w-md mx-auto perspective">
      <div className="relative h-[300px]">
        {/* Stacked cards in background */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`stack-${i}`}
            className="absolute inset-0"
            style={{
              zIndex: 3 - i,
              translateY: `${i * 10}px`,
              translateX: `${i * 5}px`,
              opacity: 1 - i * 0.2,
            }}
            animate={{
              translateY: [`${i * 10}px`, `${i * 10 + 5}px`, `${i * 10}px`],
            }}
            transition={{
              duration: 3,
              delay: i * 0.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-30"></div>
            <div className="relative bg-[#0f0f1a] p-8 rounded-xl h-[300px] border border-white/10 backdrop-blur-sm"></div>
          </motion.div>
        ))}

        {/* Active card with flip animation */}
        <div className="absolute inset-0 z-10" onClick={handleCardClick}>
          <div className="relative h-full w-full perspective">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={`${activeCard}-${isFlipped ? "back" : "front"}`}
                initial={{ rotateY: isFlipped ? -90 : 90 }}
                animate={{ rotateY: 0 }}
                exit={{ rotateY: isFlipped ? 90 : -90 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 backface-hidden"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-[#0f0f1a] p-8 rounded-xl h-full flex flex-col justify-between border border-white/10 backdrop-blur-sm">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                      {isFlipped ? "Answer" : "Question"} #{activeCard + 1}
                    </Badge>
                    <div className="flex space-x-1">
                      {flashcards.map((_, i) => (
                        <motion.div
                          key={i}
                          className={`h-1.5 w-6 rounded-full cursor-pointer ${
                            i === activeCard ? "bg-indigo-500" : "bg-white/20"
                          }`}
                          whileHover={{ scale: 1.2 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveCard(i)
                            setIsFlipped(false)
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="my-4 text-center">
                    <motion.h3
                      className="text-xl font-bold mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {isFlipped ? flashcards[activeCard].answer : flashcards[activeCard].question}
                    </motion.h3>
                    {!isFlipped && (
                      <motion.p
                        className="text-white/70 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        (Click to reveal answer)
                      </motion.p>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-white/50">
                    <div>Created by: 0x71...3e4f</div>
                    <div className="flex items-center">
                      <motion.div
                        className="h-2 w-2 rounded-full bg-green-500 mr-1"
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      />
                      Stored on IPFS
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating particles around the card */}
      {/* <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute h-1 w-1 rounded-full bg-purple-500/50"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div> */} 
    </div>
  )
}
