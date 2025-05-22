import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, Box, Stack, Typography, Button, Snackbar, Alert } from '@mui/material';
import { ethers } from 'ethers';
import FlashcardForm from './components/FlashcardForm';
import FlashcardList from './components/FlashcardList';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import DeckForm from './components/DeckForm';
import './App.css';

const theme = createTheme();

// Import ABI from blockchain build
import FlashcardVaultArtifact from  "../../blockchin/artifacts/contracts/FlashcardVault.sol/FlashcardVault.json";
import Profile from './components/Profile/';
const contractABI = FlashcardVaultArtifact.abi;

// Contract address (you'll need to update this after deployment)
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentView, setCurrentView] = useState('dashboard'); // ['dashboard', 'flashcard', 'deck', 'profile']

  // Initialize ethers provider and connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed!');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create ethers provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum); // for ethers v6
      const signer = await provider.getSigner(); // this returns a proper Signer instance

      const address = await signer.getAddress(); // ✅ now this will work
      setAccount(address);
      setIsConnected(true);
    } catch (err) {
      console.error('Error connecting wallet:', err);
    }
  };

  useEffect(() => {
    const initContract = async () => {
      if (!account || !window.ethereum) return;
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      setProvider(provider);
      setSigner(signer);
  
      const flashcardContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      setContract(flashcardContract);
    };
  
    initContract();
  }, [account]);

  const handleAddFlashcard = async (question, answer, cid) => {
    try {
      if (!contract) {
        console.error("Contract is not initialized.");
        return;
      }
  
      const tx = await contract.addFlashcard(question, answer, cid); // your smart contract method
      await tx.wait();
      setSnackbar({
        open: true,
        message: 'Flashcard added to the blockchain!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding flashcard:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add flashcard to blockchain',
        severity: 'error'
      });
    }
  };

  const handleCreateDeck = async (name, description, flashcardCids, cid) => {
    try {
      if (!contract) {
        console.error("Contract is not initialized.");
        return;
      }
  
      const tx = await contract.createDeck(name, description, flashcardCids, cid);
      await tx.wait();
      setSnackbar({
        open: true,
        message: 'Deck created successfully!',
        severity: 'success'
      });
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error creating deck:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create deck',
        severity: 'error'
      });
    }
  };

  const handleDisconnect = () => {
    setAccount('');
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    if (!account) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={connectWallet}
            size="large"
          >
            Connect Wallet
          </Button>
           </Box>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            onCreateFlashcard={() => setCurrentView('flashcard')}
            onCreateDeck={() => setCurrentView('deck')}
            onViewProfile={() => setCurrentView('profile')}
          />
        );
      case 'flashcard':
        return (
          <FlashcardForm
            onSubmit={handleAddFlashcard}
            isConnected={!!account}
          />
        );
      case 'deck':
        return (
          <DeckForm
            contract={contract}
            onSubmit={handleCreateDeck}
            isConnected={!!account}
          />
        );
      case 'profile':
        return (
          <Profile/>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <Navigation
          account={account}
          onDisconnect={handleDisconnect}
          onNavigate={setCurrentView}
          onBack={() => setCurrentView('dashboard')}
          showBack={currentView !== 'dashboard'}
        />
        <Box sx={{ p: 4, pt: 8 }}>
          {renderContent()}
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
export default App
