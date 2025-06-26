"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface NeonTextProps {
  children: ReactNode
  className?: string
  color?: "purple" | "indigo" | "blue" | "gradient"
}

export function NeonText({ children, className, color = "purple" }: NeonTextProps) {
  const getTextColor = () => {
    switch (color) {
      case "purple":
        return "text-purple-500"
      case "indigo":
        return "text-indigo-500"
      case "blue":
        return "text-blue-500"
      case "gradient":
        return "bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent"
      default:
        return "text-purple-500"
    }
  }

  const getGlowColor = () => {
    switch (color) {
      case "purple":
        return "#9333ea"
      case "indigo":
        return "#6366f1"
      case "blue":
        return "#3b82f6"
      case "gradient":
        return "#9333ea"
      default:
        return "#9333ea"
    }
  }

  return (
    <motion.span
      className={cn(getTextColor(), className)}
      style={{
        textShadow: `0 0 5px ${getGlowColor()}80, 0 0 10px ${getGlowColor()}40`,
      }}
      animate={{
        textShadow: [
          `0 0 5px ${getGlowColor()}80, 0 0 10px ${getGlowColor()}40`,
          `0 0 7px ${getGlowColor()}90, 0 0 15px ${getGlowColor()}60`,
          `0 0 5px ${getGlowColor()}80, 0 0 10px ${getGlowColor()}40`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.span>
  )
}
