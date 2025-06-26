"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWallet } from "@/hooks/useWallet"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import {
  Brain,
  Wallet,
  Database,
  ChevronRight,
  Trophy,
  Clock,
  Github,
  Twitter,
  TextIcon as Telegram,
  DiscIcon as Discord,
  Zap,
  Award,
  Users,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ParticlesContainer } from "@/components/particles-container"
import { FlashcardDeck } from "@/components/flashcard-deck"
import { BlockchainAnimation } from "@/components/blockchain-animation"
import { GlowingButton } from "@/components/glowing-button"
import { NeonText } from "@/components/neon-text"
import { HexagonGrid } from "@/components/hexagon-grid"
import { GameCard } from "@/components/game-card"

export default function LandingPage() {
  const { account, isConnected, connectWallet, disconnectWallet } = useWallet()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const { scrollYProgress } = useScroll()
  const heroRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const gamifyRef = useRef<HTMLDivElement>(null)
  const blockchainRef = useRef<HTMLDivElement>(null)
  const communityRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set client-side flag
    setIsClient(true)

    // Set up flashcard interval
    const flashcardInterval = setInterval(() => {
      setActiveFlashcard((prev) => (prev + 1) % flashcards.length)
    }, 3000)

    // Clean up interval
    return () => clearInterval(flashcardInterval)
  }, [])

  // Separate effect for navigation to avoid race conditions
  useEffect(() => {
    if (isClient && isConnected) {
      router.replace("/dashboard")
    }
  }, [isClient, isConnected, router])

  const [activeFlashcard, setActiveFlashcard] = useState(0)
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const flashcards = [
    { question: "What is Web3?", answer: "A decentralized version of the internet based on blockchain technology" },
    {
      question: "What is IPFS?",
      answer: "InterPlanetary File System - a protocol for storing and sharing data in a distributed system",
    },
    {
      question: "What are Smart Contracts?",
      answer: "Self-executing contracts with the terms directly written into code",
    },
  ]

  // Animation values
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50])

  // Parallax effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 300])
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6], [1, 0.8, 0.6, 0.4])

  // Spring animations for smoother effects
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const scaleSpring = useSpring(useMotionValue(1), springConfig)

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const pulseAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  const glowAnimation = {
    initial: { boxShadow: "0 0 0 rgba(139, 92, 246, 0)" },
    animate: {
      boxShadow: ["0 0 0 rgba(139, 92, 246, 0)", "0 0 20px rgba(139, 92, 246, 0.5)", "0 0 0 rgba(139, 92, 246, 0)"],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className="min-h-screen bg-[#0a0a16] text-white overflow-hidden">
      {/* Animated background with particles */}
      <div className="fixed inset-0 z-0">
        <ParticlesContainer />
        <motion.div style={{ y: backgroundY, opacity: backgroundOpacity }} className="absolute inset-0">
          <div
            className="absolute top-0 left-[10%] w-[40%] h-[40%] rounded-full bg-purple-700/20 blur-[100px] animate-pulse"
            style={{ animationDuration: "15s" }}
          />
          <div
            className="absolute bottom-0 right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-700/20 blur-[100px] animate-pulse"
            style={{ animationDuration: "20s" }}
          />
          <div
            className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-700/20 blur-[100px] animate-pulse"
            style={{ animationDuration: "25s" }}
          />
        </motion.div>
      </div>

      {/* Header with glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a16]/60 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.div
              animate={{
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Brain className="h-8 w-8 text-purple-500 mr-2" />
            </motion.div>
            <div className="flex items-baseline">
              <NeonText className="text-2xl font-bold" color="purple">
                Cogni.ai
              </NeonText>
              <span className="text-xs ml-1 text-white/70 font-medium relative top-[-5px]">web3 edition</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { name: "How It Works", href: "#how-it-works" },
              { name: "Gamify Learning", href: "#gamify" },
              { name: "Blockchain", href: "#blockchain" },
              { name: "Community", href: "#community" },
            ].map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>
          <GlowingButton onClick={isConnected ? disconnectWallet : connectWallet}>
            {isConnected ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
          </GlowingButton>
        </div>
      </header>

      {/* Hero Section with dynamic background and interactive flashcards */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
        <div className="container mx-auto px-4 py-20 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div style={{ opacity, scale, y }} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1">
                  <motion.span
                    animate={{
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <Zap className="h-3 w-3 mr-1 inline" />
                  </motion.span>
                  Revolutionary Learning
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <NeonText className="text-4xl md:text-6xl font-bold" color="gradient">
                  Own Your Knowledge
                </NeonText>
                <br />
                <span className="text-white">On The Blockchain</span>
              </motion.h1>

              <motion.p
                className="text-lg text-white/70 max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Create, store, and prove ownership of flashcard decks on-chain. Learn, earn, and share knowledge in a
                decentralized ecosystem.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <GlowingButton size="lg" color="purple">
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </GlowingButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 relative overflow-hidden group"
                >
                  <span className="relative z-10">Learn More</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/30 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-full group-hover:translate-x-0"></span>
                </Button>
              </motion.div>
            </motion.div>

            <div className="relative h-[400px] flex items-center justify-center">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg blur-3xl"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              <div className="relative w-full max-w-md mx-auto">
                <FlashcardDeck
                  flashcards={flashcards}
                  activeCard={activeFlashcard}
                  setActiveCard={setActiveFlashcard}
                />
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-10 left-0 right-0 flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <ChevronRight className="h-8 w-8 text-white/50 rotate-90" />
        </motion.div>
      </section>

      {/* How It Works Section with interactive flow */}
      <section id="how-it-works" ref={howItWorksRef} className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 mb-4">
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Zap className="h-3 w-3 mr-1 inline" />
              </motion.span>
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Three simple steps to revolutionize your learning experience with blockchain technology
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting lines with animated glow */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600/0 via-purple-600/50 to-indigo-600/0 hidden md:block">
              <motion.div
                className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-purple-600/0 via-purple-600 to-purple-600/0"
                animate={{
                  x: ["-100%", "400%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
            >
              {[
                {
                  icon: <Brain className="h-10 w-10 text-purple-500" />,
                  title: "Create",
                  description: "Design your flashcard decks with rich content, questions, and answers",
                },
                {
                  icon: <Database className="h-10 w-10 text-indigo-500" />,
                  title: "Store",
                  description: "Save your content permanently on IPFS and register ownership on-chain",
                },
                {
                  icon: <Wallet className="h-10 w-10 text-blue-500" />,
                  title: "Own",
                  description: "Maintain verifiable ownership of your educational content forever",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="relative"
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                >
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-30"
                    animate={
                      hoveredStep === index
                        ? {
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.02, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: hoveredStep === index ? Number.POSITIVE_INFINITY : 0,
                      ease: "easeInOut",
                    }}
                  />
                  <Card className="relative bg-[#0f0f1a]/50 border border-white/10 backdrop-blur-sm h-full group transition-all duration-300">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                      <motion.div
                        className="mb-6 p-4 bg-white/5 rounded-full"
                        animate={
                          hoveredStep === index
                            ? {
                                rotate: [0, 5, 0, -5, 0],
                                scale: [1, 1.1, 1],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: hoveredStep === index ? Number.POSITIVE_INFINITY : 0,
                          ease: "easeInOut",
                        }}
                      >
                        {item.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-white/70">{item.description}</p>

                      <motion.div
                        className="mt-6 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl font-bold"
                        animate={
                          hoveredStep === index
                            ? {
                                boxShadow: [
                                  "0 0 0 rgba(139, 92, 246, 0)",
                                  "0 0 20px rgba(139, 92, 246, 0.5)",
                                  "0 0 0 rgba(139, 92, 246, 0)",
                                ],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          repeat: hoveredStep === index ? Number.POSITIVE_INFINITY : 0,
                          ease: "easeInOut",
                        }}
                      >
                        {index + 1}
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gamify Learning Section with game interface */}
      <section id="gamify" ref={gamifyRef} className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="order-2 lg:order-1"
            >
              <div className="relative">
                <HexagonGrid />
                <div className="relative z-10 grid grid-cols-2 gap-6">
                  {[
                    {
                      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
                      title: "Earn Rewards",
                      description: "Get tokens for completing learning milestones",
                    },
                    {
                      icon: <Award className="h-8 w-8 text-purple-500" />,
                      title: "Collect Badges",
                      description: "Unlock NFT badges for your achievements",
                    },
                    {
                      icon: <Clock className="h-8 w-8 text-indigo-500" />,
                      title: "Track Progress",
                      description: "Monitor your learning journey on-chain",
                    },
                    {
                      icon: <Users className="h-8 w-8 text-blue-500" />,
                      title: "Compete",
                      description: "Join leaderboards and challenge friends",
                    },
                  ].map((item, index) => (
                    <GameCard
                      key={index}
                      icon={item.icon}
                      title={item.title}
                      description={item.description}
                      index={index}
                      setHovered={setHoveredCard}
                      isHovered={hoveredCard === index}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="order-1 lg:order-2"
            >
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4">
                <motion.span
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <Zap className="h-3 w-3 mr-1 inline" />
                </motion.span>
                Learn-to-Earn
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Gamify Your Learning Experience</h2>
              <p className="text-white/70 mb-6">
                Transform education into an engaging game with rewards, achievements, and friendly competition. Earn
                tokens as you learn and collect unique NFT badges to showcase your knowledge journey.
              </p>

              {/* Animated progress bar */}
              <div className="relative h-4 w-full bg-white/10 rounded-full mb-8 overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full w-3/4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                  initial={{ width: "0%" }}
                  whileInView={{ width: "75%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  <motion.div
                    className="absolute -right-2 -top-2 h-8 w-8 bg-white rounded-full flex items-center justify-center text-xs font-bold text-indigo-900"
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(255, 255, 255, 0.5)",
                        "0 0 20px rgba(255, 255, 255, 0.8)",
                        "0 0 0 rgba(255, 255, 255, 0.5)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    75%
                  </motion.div>
                </motion.div>

                {/* Animated particles along the progress bar */}
                <motion.div
                  className="absolute top-0 left-0 h-full w-full"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 h-1 w-1 bg-white rounded-full"
                      style={{ left: `${15 + i * 15}%` }}
                      animate={{
                        y: [-4, 0, -4],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </motion.div>
              </div>

              <GlowingButton>Start Earning</GlowingButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Built on Blockchain Section with animated visualization */}
      <section id="blockchain" ref={blockchainRef} className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Lock className="h-3 w-3 mr-1 inline" />
              </motion.span>
              Decentralized
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Built on Blockchain</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Leveraging the power of decentralized technologies to ensure your content remains secure, verifiable, and
              truly yours
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg blur-3xl"
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="relative grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-[#0f0f1a]/50 backdrop-blur-sm rounded-xl border border-white/10"
            >
              <motion.div variants={fadeInUp} className="space-y-6">
                <h3 className="text-2xl font-bold">IPFS Storage</h3>
                <p className="text-white/70">
                  Your flashcards are stored on the InterPlanetary File System (IPFS), a peer-to-peer hypermedia
                  protocol designed to preserve and grow humanity's knowledge.
                </p>
                <ul className="space-y-2">
                  {["Content-addressed", "Permanent", "Decentralized", "Censorship resistant"].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <motion.div
                        className="h-2 w-2 rounded-full bg-purple-500 mr-2"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          delay: index * 0.2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={fadeInUp} className="space-y-6">
                <h3 className="text-2xl font-bold">Smart Contracts</h3>
                <p className="text-white/70">
                  Ownership and access rights are managed through secure smart contracts, ensuring transparent and
                  trustless interactions.
                </p>
                <ul className="space-y-2">
                  {["Verifiable ownership", "Transparent rewards", "Automated royalties", "Immutable records"].map(
                    (item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        <motion.div
                          className="h-2 w-2 rounded-full bg-indigo-500 mr-2"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 2,
                            delay: index * 0.2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        />
                        <span>{item}</span>
                      </motion.li>
                    ),
                  )}
                </ul>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="md:col-span-2 mt-6"
                whileInView={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="relative">
                  <BlockchainAnimation />
                  <div className="relative z-10 p-4 bg-black/40 rounded-lg border border-white/10 font-mono text-sm text-white/70 overflow-x-auto">
                    <pre>
                      {`// Example Smart Contract
contract FlashcardOwnership {
    mapping(uint256 => address) public flashcardOwner;
    
    function createFlashcard(uint256 _tokenId, string memory _ipfsHash) public {
        flashcardOwner[_tokenId] = msg.sender;
        emit FlashcardCreated(_tokenId, _ipfsHash, msg.sender);
    }
    
    function verifyOwnership(uint256 _tokenId, address _owner) public view returns (bool) {
        return flashcardOwner[_tokenId] == _owner;
    }
}`}
                    </pre>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Section with interactive cards */}
      <section id="community" ref={communityRef} className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 mb-4">
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Users className="h-3 w-3 mr-1 inline" />
              </motion.span>
              Explore Together
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Join Our Community</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Discover flashcard decks created by others and share your knowledge with the world
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Blockchain Basics",
                creator: "0x8f...2e3d",
                cards: 24,
                views: 1.2,
                gradient: "from-purple-600 to-indigo-600",
              },
              {
                title: "Solidity Programming",
                creator: "0x3a...9c7b",
                cards: 42,
                views: 3.5,
                gradient: "from-indigo-600 to-blue-600",
              },
              {
                title: "DeFi Fundamentals",
                creator: "0x6d...1f4a",
                cards: 36,
                views: 2.8,
                gradient: "from-blue-600 to-purple-600",
              },
            ].map((deck, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative group"
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <motion.div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${deck.gradient} rounded-xl blur opacity-30`}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                />
                <Card className="relative bg-[#0f0f1a]/50 border border-white/10 backdrop-blur-sm h-full overflow-hidden">
                  <div className={`h-2 w-full bg-gradient-to-r ${deck.gradient}`} />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-bold">{deck.title}</h3>
                      <Badge variant="outline" className="border-white/20 text-white/70">
                        {deck.cards} cards
                      </Badge>
                    </div>

                    <div className="flex items-center text-sm text-white/50 mb-6">
                      <motion.div
                        className={`w-6 h-6 rounded-full bg-gradient-to-r ${deck.gradient} mr-2`}
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      />
                      Created by: {deck.creator}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-white/70">{deck.views}k views</div>
                      <Button variant="ghost" className="text-white hover:bg-white/10 relative overflow-hidden group">
                        <span className="relative z-10">View Deck</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/30 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-full group-hover:translate-x-0"></span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="mt-12 text-center"
          >
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 relative overflow-hidden group"
            >
              <span className="relative z-10">Explore All Decks</span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/30 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-full group-hover:translate-x-0"></span>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Call to Action with animated effects */}
      <section ref={ctaRef} className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg blur-3xl"
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="relative p-8 md:p-12 bg-[#0f0f1a]/50 backdrop-blur-sm rounded-xl border border-white/10 text-center"
            >
              <motion.div
                className="absolute inset-0 rounded-xl"
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(139, 92, 246, 0)",
                    "0 0 30px rgba(139, 92, 246, 0.3)",
                    "0 0 0 rgba(139, 92, 246, 0)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Revolutionize Your Learning?</h2>
              <p className="text-white/70 max-w-2xl mx-auto mb-8">
                Join thousands of learners who are already creating, owning, and sharing knowledge on the blockchain.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 relative overflow-hidden group"
                >
                  <span className="relative z-10">Connect Wallet</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/30 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-full group-hover:translate-x-0"></span>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer with animated elements */}
      <footer className="py-12 border-t border-white/10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <motion.div
                  animate={{
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <Brain className="h-6 w-6 text-purple-500 mr-2" />
                </motion.div>
                <div className="flex items-baseline">
                  <NeonText className="text-xl font-bold" color="gradient">
                    Cogni.ai
                  </NeonText>
                  <span className="text-xs ml-1 text-white/70 font-medium relative top-[-3px]">web3 edition</span>
                </div>
              </div>
              <p className="text-white/70 mb-6 max-w-md">
                Revolutionizing learning through blockchain technology. Create, own, and share knowledge in a
                decentralized ecosystem.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: <Discord className="h-5 w-5" />, name: "Discord" },
                  { icon: <Telegram className="h-5 w-5" />, name: "Telegram" },
                  { icon: <Twitter className="h-5 w-5" />, name: "Twitter" },
                  { icon: <Github className="h-5 w-5" />, name: "GitHub" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href="#"
                    className="text-white/50 hover:text-white transition-colors relative group"
                  >
                    <motion.div
                      whileHover={{
                        scale: 1.2,
                        rotate: [0, 5, 0, -5, 0],
                        color: "#fff",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {social.icon}
                    </motion.div>
                    <motion.div
                      className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100"
                      whileHover={{
                        boxShadow: ["0 0 0 rgba(139, 92, 246, 0)", "0 0 10px rgba(139, 92, 246, 0.5)"],
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                {["Features", "Roadmap", "Pricing", "FAQ"].map((item, index) => (
                  <li key={index}>
                    <Link href="#" className="text-white/70 hover:text-white transition-colors relative group">
                      <span>{item}</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                {["Documentation", "API", "Community", "Support"].map((item, index) => (
                  <li key={index}>
                    <Link href="#" className="text-white/70 hover:text-white transition-colors relative group">
                      <span>{item}</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/50 text-sm">&copy; {new Date().getFullYear()} Cogni.ai. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm relative group">
                <span>Privacy Policy</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm relative group">
                <span>Terms of Service</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
