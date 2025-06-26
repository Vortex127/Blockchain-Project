"use client"

import { useEffect, useRef } from "react"

export function BlockchainAnimation() {
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

    // Create blocks
    const blocks = []
    const blockCount = 5
    const blockWidth = canvas.width / blockCount - 20
    const blockHeight = 60

    for (let i = 0; i < blockCount; i++) {
      blocks.push({
        x: i * (blockWidth + 20) + 10,
        y: canvas.height / 2 - blockHeight / 2,
        width: blockWidth,
        height: blockHeight,
        color: i % 2 === 0 ? "#9333ea" : "#6366f1",
        glowIntensity: 0,
        glowDirection: 1,
      })
    }

    // Create connections
    const connections = []
    for (let i = 0; i < blocks.length - 1; i++) {
      connections.push({
        startX: blocks[i].x + blocks[i].width,
        startY: blocks[i].y + blocks[i].height / 2,
        endX: blocks[i + 1].x,
        endY: blocks[i + 1].y + blocks[i].height / 2,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
      })
    }

    // Create data particles
    const particles = []
    const createParticle = (connectionIndex) => {
      const connection = connections[connectionIndex]
      particles.push({
        x: connection.startX,
        y: connection.startY,
        size: 3 + Math.random() * 2,
        speed: 0.5 + Math.random() * 1,
        connectionIndex,
        progress: 0,
        color: Math.random() > 0.5 ? "#9333ea" : "#6366f1",
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      connections.forEach((connection, index) => {
        ctx.beginPath()
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 2
        ctx.moveTo(connection.startX, connection.startY)
        ctx.lineTo(connection.endX, connection.endY)
        ctx.stroke()

        // Randomly create particles
        if (Math.random() < 0.02) {
          createParticle(index)
        }
      })

      // Draw blocks
      blocks.forEach((block, index) => {
        // Update glow intensity
        block.glowIntensity += 0.02 * block.glowDirection
        if (block.glowIntensity > 1) {
          block.glowDirection = -1
        } else if (block.glowIntensity < 0) {
          block.glowDirection = 1
        }

        // Draw glow
        const glow = ctx.createRadialGradient(
          block.x + block.width / 2,
          block.y + block.height / 2,
          0,
          block.x + block.width / 2,
          block.y + block.height / 2,
          block.width,
        )
        glow.addColorStop(0, `rgba(147, 51, 234, ${0.2 * block.glowIntensity})`)
        glow.addColorStop(1, "rgba(147, 51, 234, 0)")

        ctx.fillStyle = glow
        ctx.fillRect(block.x - block.width / 2, block.y - block.height / 2, block.width * 2, block.height * 2)

        // Draw block
        ctx.fillStyle = block.color
        ctx.globalAlpha = 0.7
        ctx.fillRect(block.x, block.y, block.width, block.height)
        ctx.globalAlpha = 1

        // Draw border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
        ctx.lineWidth = 1
        ctx.strokeRect(block.x, block.y, block.width, block.height)

        // Draw hash
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
        ctx.font = "10px monospace"
        ctx.fillText(`Block #${index}`, block.x + 10, block.y + 20)
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
        ctx.fillText(`0x${Math.random().toString(16).slice(2, 10)}`, block.x + 10, block.y + 40)
      })

      // Draw and update particles
      particles.forEach((particle, index) => {
        const connection = connections[particle.connectionIndex]

        // Update position
        particle.progress += particle.speed / 100
        if (particle.progress >= 1) {
          particles.splice(index, 1)
          return
        }

        particle.x = connection.startX + (connection.endX - connection.startX) * particle.progress
        particle.y = connection.startY + (connection.endY - connection.startY) * particle.progress

        // Draw particle
        ctx.beginPath()
        ctx.fillStyle = particle.color
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Draw glow
        ctx.beginPath()
        const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 3)
        glow.addColorStop(0, `${particle.color}`)
        glow.addColorStop(1, "rgba(147, 51, 234, 0)")

        ctx.fillStyle = glow
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return (
    <div className="absolute inset-0 z-0 opacity-30">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
