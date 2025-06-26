"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface GameCardProps {
  icon: ReactNode
  title: string
  description: string
  index: number
  isHovered: boolean
  setHovered: (index: number | null) => void
}

export function GameCard({ icon, title, description, index, isHovered, setHovered }: GameCardProps) {
  return (
    <motion.div
      className="relative"
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-30"
        animate={
          isHovered
            ? {
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
          ease: "easeInOut",
        }}
      />
      <Card className="relative bg-[#0f0f1a]/50 border border-white/10 backdrop-blur-sm h-full">
        <CardContent className="p-6">
          <motion.div
            className="mb-4 p-3 bg-white/5 rounded-full inline-block"
            animate={
              isHovered
                ? {
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
            }}
          >
            {icon}
          </motion.div>
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-sm text-white/70">{description}</p>

          {/* Particles that appear on hover */}
          {isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute h-1 w-1 rounded-full bg-purple-500/50"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    y: [0, -20],
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1 + Math.random(),
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
