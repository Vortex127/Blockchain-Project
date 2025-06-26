"use client"

import { useEffect, useRef } from "react"

export function HexagonGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Hexagon properties
    const hexSize = 20
    const hexHeight = hexSize * Math.sqrt(3)
    const hexWidth = hexSize * 2
    const hexVertical = hexHeight
    const hexHorizontal = hexWidth * 0.75

    // Calculate grid dimensions
    const columns = Math.ceil(canvas.width / hexHorizontal) + 1
    const rows = Math.ceil(canvas.height / hexVertical) + 1

    // Create hexagons
    const hexagons = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const x = col * hexHorizontal
        const y = row * hexVertical + (col % 2 === 0 ? 0 : hexHeight / 2)

        hexagons.push({
          x,
          y,
          size: hexSize,
          opacity: 0.05 + Math.random() * 0.1,
          pulseSpeed: 0.5 + Math.random() * 1,
          pulseDirection: Math.random() > 0.5 ? 1 : -1,
          color: Math.random() > 0.7 ? "#9333ea" : Math.random() > 0.5 ? "#6366f1" : "#3b82f6",
        })
      }
    }

    // Draw hexagon
    const drawHexagon = (x, y, size, opacity, color) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const xPos = x + size * Math.cos(angle)
        const yPos = y + size * Math.sin(angle)

        if (i === 0) {
          ctx.moveTo(xPos, yPos)
        } else {
          ctx.lineTo(xPos, yPos)
        }
      }
      ctx.closePath()

      ctx.fillStyle = color.replace(")", `, ${opacity})`)
      ctx.fill()

      ctx.strokeStyle = color.replace(")", ", 0.3)")
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Animation loop
    let animationFrame
    const animate = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      hexagons.forEach((hexagon) => {
        // Update opacity for pulsing effect
        hexagon.opacity += 0.001 * hexagon.pulseSpeed * hexagon.pulseDirection

        if (hexagon.opacity > 0.2) {
          hexagon.pulseDirection = -1
        } else if (hexagon.opacity < 0.05) {
          hexagon.pulseDirection = 1
        }

        drawHexagon(hexagon.x, hexagon.y, hexagon.size, hexagon.opacity, hexagon.color)
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />
}
