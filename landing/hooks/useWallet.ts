import { useState, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import { FlashcardVaultContract } from '../contracts/FlashcardVault'
import FlashcardVaultArtifact from "../../blockchin/artifacts/contracts/FlashcardVault.sol/FlashcardVault.json"

export interface WalletState {
  account: string
  isConnected: boolean
  isLoading: boolean
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  contract: FlashcardVaultContract | null
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    account: '',
    isConnected: false,
    isLoading: true,
    provider: null,
    signer: null,
    contract: null,
  })

  const initializeContract = async (signer: ethers.JsonRpcSigner) => {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    if (!contractAddress) {
      throw new Error('Contract address not configured')
    }    return new ethers.Contract(
      contractAddress,
      FlashcardVaultArtifact.abi,
      signer
    ) as unknown as FlashcardVaultContract
  }

  const connectWallet = useCallback(async () => {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true }))
      
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this application!')
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const contract = await initializeContract(signer)

      const newState = {
        account: address,
        isConnected: true,
        isLoading: false,
        provider,
        signer,
        contract,
      }

      setWalletState(newState)
      localStorage.setItem('walletConnected', 'true')

      return true
    } catch (err) {
      console.error('Error connecting wallet:', err)
      setWalletState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setWalletState({
      account: '',
      isConnected: false,
      isLoading: false,
      provider: null,
      signer: null,
      contract: null,
    })
    localStorage.removeItem('walletConnected')
  }, [])

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      // Always set loading to false if no localStorage flag
      if (!localStorage.getItem('walletConnected')) {
        setWalletState(prev => ({ ...prev, isLoading: false }))
        return
      }

      if (window.ethereum && localStorage.getItem('walletConnected') === 'true') {
        try {
          // Check if already connected to avoid unnecessary state changes
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0 && !walletState.isConnected) {
            await connectWallet()
          } else {
            // Set loading to false if no accounts or already connected
            setWalletState(prev => ({ ...prev, isLoading: false }))
          }
        } catch (error) {
          console.error('Failed to auto-connect wallet:', error)
          localStorage.removeItem('walletConnected')
          setWalletState(prev => ({ ...prev, isLoading: false }))
        }
      } else {
        // Set loading to false if no ethereum or no connection flag
        setWalletState(prev => ({ ...prev, isLoading: false }))
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(autoConnect, 100)
    return () => clearTimeout(timer)
  }, [connectWallet, walletState.isConnected])

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          await connectWallet()
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', connectWallet)
        window.ethereum.removeListener('chainChanged', () => {})
      }
    }
  }, [connectWallet, disconnectWallet])

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
  }
} 