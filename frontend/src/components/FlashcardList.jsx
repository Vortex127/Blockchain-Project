import { useState, useEffect } from 'react';
import { Box, Grid, Typography, Stack, Alert, Snackbar } from '@mui/material';
import axios from 'axios';

const FlashcardList = ({ contract, account }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

  const loadFlashcards = async () => {
    if (!contract || !account) return;

    try {
      setIsLoading(true);
      const cards = await contract.getFlashcardsByOwner(account);

      // Fetch content from IPFS for each card
      const flashcardsWithContent = await Promise.all(
        cards.map(async (card) => {
          try {
            const response = await axios.get(`${PINATA_GATEWAY}${card.ipfsCid}`);
            const ipfsData = response.data;
            return {
              ...card,
              question: ipfsData.question,
              answer: ipfsData.answer,
              timestamp: new Date(ipfsData.timestamp).toLocaleDateString(),
              ipfsCid: card.ipfsCid // Ensure CID is preserved
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFlashcards();
  }, [contract, account, flashcards.length]);

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography>Loading flashcards...</Typography>
      </Box>
    );
  }

  if (!flashcards.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography>No flashcards found. Create your first one!</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 4 }}>Your Flashcards</Typography>
      <Grid container spacing={4}>
        {flashcards.map((card, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Box sx={{
              p: 5,
              boxShadow: 1,
              border: 1,
              borderColor: 'grey.200',
              borderRadius: 1,
              bgcolor: 'white'
            }}>
              <Stack spacing={3}>
                <Typography fontWeight="bold" sx={{ color: 'text.primary' }}>Question:</Typography>
                <Typography sx={{ color: 'text.primary', fontSize: '1.1rem' }}>{card.question}</Typography>
                <Typography fontWeight="bold" sx={{ color: 'text.primary', mt: 2 }}>Answer:</Typography>
                <Typography sx={{ color: 'text.primary', fontSize: '1.1rem' }}>{card.answer}</Typography>
                <Typography variant="body2" sx={{ 
                  color: 'text.secondary',
                  mt: 2,
                  fontSize: '0.9rem'
                }}>
                  Created: {card.timestamp}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: 'text.secondary',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  mt: 2,
                  display: 'block'
                }}>
                  CID: {card.ipfsCid}
                </Typography>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
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
  );
};

export default FlashcardList;