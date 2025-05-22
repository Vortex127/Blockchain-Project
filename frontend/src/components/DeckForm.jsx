import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Stack,
  Snackbar,
  Alert,
  Paper,
  Typography,
  CircularProgress,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  useTheme,
  alpha,
  Chip,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`
    }
  },
  '& .MuiInputLabel-root': {
    transition: 'all 0.3s ease'
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.2)}, transparent)`,
    transition: 'all 0.6s ease',
  },
  '&:hover:before': {
    left: '100%',
  }
}));

const DeckForm = ({ contract, onSubmit, isConnected }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [selectedFlashcards, setSelectedFlashcards] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const theme = useTheme();

  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
  const PINATA_ENDPOINT = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
  const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

  // Load user's flashcards
  useEffect(() => {
    const loadFlashcards = async () => {
      if (!contract || !isConnected) return;

      try {
        const signer = await contract.runner.provider.getSigner();
        const address = await signer.getAddress();
        const cards = await contract.getFlashcardsByOwner(address);
        
        // Fetch content from IPFS for each card
        const flashcardsWithContent = await Promise.all(
          cards.map(async (card) => {
            try {
              const response = await axios.get(`${PINATA_GATEWAY}${card.ipfsCid}`);
              return {
                ...card,
                ...response.data,
                ipfsCid: card.ipfsCid
              };
            } catch (error) {
              console.error(`Error fetching IPFS content for ${card.ipfsCid}:`, error);
              return card;
            }
          })
        );

        setFlashcards(flashcardsWithContent);
      } catch (error) {
        console.error('Error loading flashcards:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load flashcards',
          severity: 'error'
        });
      }
    };

    loadFlashcards();
  }, [contract, isConnected]);

  // Handle flashcard selection
  const handleFlashcardToggle = (flashcard) => {
    setSelectedFlashcards(prev => {
      const isSelected = prev.some(card => card.ipfsCid === flashcard.ipfsCid);
      if (isSelected) {
        return prev.filter(card => card.ipfsCid !== flashcard.ipfsCid);
      } else {
        return [...prev, flashcard];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      setSnackbar({
        open: true,
        message: 'Please connect your wallet first',
        severity: 'warning'
      });
      return;
    }

    if (!name || !description || selectedFlashcards.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields and select at least one flashcard',
        severity: 'warning'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare deck data
      const deckData = {
        name,
        description,
        flashcards: selectedFlashcards.map(card => {
          // Create a new object with only the necessary properties
          const sanitizedCard = {
            question: card.question,
            answer: card.answer,
            ipfsCid: card.ipfsCid,
            id: card.id ? card.id.toString() : undefined,
            owner: card.owner ? card.owner.toString() : undefined,
            timestamp: card.timestamp ? card.timestamp.toString() : Date.now().toString()
          };
          return sanitizedCard;
        }),
        timestamp: Date.now().toString()
      };

      // Upload to IPFS via Pinata
      const response = await axios.post(
        PINATA_ENDPOINT,
        deckData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PINATA_JWT}`
          }
        }
      );
      
      const cid = response.data.IpfsHash;
      setUploadProgress(100);

      // Call parent's onSubmit with the data and IPFS CID
      await onSubmit(name, description, selectedFlashcards.map(card => card.ipfsCid), cid);

      // Reset form
      setName('');
      setDescription('');
      setSelectedFlashcards([]);

      setSnackbar({
        open: true,
        message: 'Your deck has been created successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating deck:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create deck',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StyledPaper>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Create New Deck
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Organize your flashcards into a themed deck
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <StyledTextField
                label="Deck Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
              />

              <StyledTextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
                required
              />

              <Typography variant="h6" sx={{ mt: 2 }}>
                Select Flashcards
              </Typography>

              <List>
                {flashcards.map((flashcard) => (
                  <ListItem
                    key={flashcard.ipfsCid}
                    sx={{
                      mb: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      boxShadow: 1,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    <Checkbox
                      checked={selectedFlashcards.some(card => card.ipfsCid === flashcard.ipfsCid)}
                      onChange={() => handleFlashcardToggle(flashcard)}
                    />
                    <ListItemText
                      primary={flashcard.question}
                      secondary={flashcard.answer}
                    />
                  </ListItem>
                ))}
              </List>

              {selectedFlashcards.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Selected Flashcards: {selectedFlashcards.length}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {selectedFlashcards.map((card) => (
                      <Chip
                        key={card.ipfsCid}
                        label={card.question}
                        onDelete={() => handleFlashcardToggle(card)}
                        sx={{ my: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              <Box sx={{ position: 'relative' }}>
                <SubmitButton
                  type="submit"
                  fullWidth
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                >
                  {isSubmitting ? 'Creating Deck...' : 'Create Deck'}
                </SubmitButton>

                {isSubmitting && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                )}
              </Box>
            </Stack>
          </form>
        </StyledPaper>
      </motion.div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeckForm;