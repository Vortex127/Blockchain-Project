"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GlowingButtonProps {
  children: ReactNode
  className?: string
  size?: "default" | "sm" | "lg"
  color?: "purple" | "gradient"
  onClick?: () => void
}

export function GlowingButton({
  children,
  className,
  size = "default",
  color = "purple",
  onClick,
}: GlowingButtonProps) {
  const getGradient = () => {
    if (color === "gradient") {
      return "from-purple-600 via-indigo-600 to-blue-600"
    }
    return "from-purple-600 to-indigo-600"
  }

  const getHoverGradient = () => {
    if (color === "gradient") {
      return "from-purple-700 via-indigo-700 to-blue-700"
    }
    return "from-purple-700 to-indigo-700"
  }

  return (
    <div className="relative group">
      <motion.div
        className={cn(
          "absolute -inset-0.5 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-200",
          `bg-gradient-to-r ${getGradient()}`,
        )}
        animate={{
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <Button
        size={size}
        onClick={onClick}
        className={cn(
          `relative bg-gradient-to-r ${getGradient()} hover:bg-gradient-to-r hover:${getHoverGradient()} text-white border-0`,
          className,
        )}
      >
        {children}
      </Button>
    </div>
  )
}
