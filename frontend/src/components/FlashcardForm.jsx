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
  Fade,
  Chip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlipIcon from '@mui/icons-material/Flip';

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

const FlashcardPreview = styled(motion.div)(({ theme, isflipped }) => ({
  width: '100%',
  height: 200,
  perspective: '1000px',
  marginBottom: theme.spacing(4),
  cursor: 'pointer',
  '& .card-inner': {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s',
    transform: isflipped === 'true' ? 'rotateY(180deg)' : 'rotateY(0deg)'
  },
  '& .card-face': {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
    backdropFilter: 'blur(10px)'
  },
  '& .card-back': {
    transform: 'rotateY(180deg)',
    background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`
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

const FlashcardForm = ({ onSubmit, isConnected }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isFlipped, setIsFlipped] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const theme = useTheme();

  const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
  const PINATA_ENDPOINT = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

  // Simulate upload progress
  useEffect(() => {
    if (isSubmitting) {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 300);
      
      return () => clearInterval(interval);
    } else {
      setUploadProgress(0);
    }
  }, [isSubmitting]);

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

    if (!question || !answer) {
      setSnackbar({
        open: true,
        message: 'Please fill in both question and answer',
        severity: 'warning'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare flashcard data
      const flashcardData = {
        question,
        answer,
        timestamp: Date.now(),
      };

      // Upload to IPFS via Pinata
      const response = await axios.post(
        PINATA_ENDPOINT,
        flashcardData,
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
      await onSubmit(question, answer, cid);

      // Reset form
      setTimeout(() => {
        setQuestion('');
        setAnswer('');
        setIsFlipped(false);
      }, 1000);

      setSnackbar({
        open: true,
        message: 'Your flashcard has been saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating flashcard:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create flashcard',
        severity: 'error'
      });
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ 
        fontWeight: 700, 
        mb: 3,
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Create New Flashcard
      </Typography>
      
      <Chip 
        label={isConnected ? "Wallet Connected" : "Wallet Not Connected"} 
        color={isConnected ? "success" : "warning"}
        size="small"
        sx={{ mb: 3 }}
        icon={isConnected ? <CheckCircleIcon /> : undefined}
      />

      <FlashcardPreview 
        isflipped={isFlipped.toString()} 
        onClick={handleFlip}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-inner">
          <div className="card-face card-front">
            <Stack spacing={1} width="100%" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Question
              </Typography>
              <Typography variant="h6" align="center">
                {question || "Your question will appear here"}
              </Typography>
              <Box sx={{ mt: 2, opacity: 0.6 }}>
                <FlipIcon fontSize="small" />
              </Box>
            </Stack>
          </div>
          <div className="card-face card-back">
            <Stack spacing={1} width="100%" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Answer
              </Typography>
              <Typography variant="h6" align="center">
                {answer || "Your answer will appear here"}
              </Typography>
              <Box sx={{ mt: 2, opacity: 0.6 }}>
                <FlipIcon fontSize="small" />
              </Box>
            </Stack>
          </div>
        </div>
      </FlashcardPreview>

      <Divider sx={{ my: 3 }}>
        <Chip label="Form" size="small" />
      </Divider>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <Stack spacing={3}>
          <StyledTextField
            required
            label="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question"
            fullWidth
            variant="outlined"
            disabled={isSubmitting}
            InputProps={{
              sx: { py: 0.5 }
            }}
          />

          <StyledTextField
            required
            label="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter the answer"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            disabled={isSubmitting}
          />

          <SubmitButton
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? (
              <CircularProgress size={20} color="inherit" variant={uploadProgress === 100 ? "indeterminate" : "determinate"} value={uploadProgress} />
            ) : (
              <CloudUploadIcon />
            )}
          >
            {isSubmitting ? (uploadProgress === 100 ? 'Saving...' : 'Uploading to IPFS...') : 'Create Flashcard'}
          </SubmitButton>
          
          {isSubmitting && (
            <Fade in={isSubmitting}>
              <Box sx={{ width: '100%', mt: 1 }}>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                  {uploadProgress === 100 ? 'Saving to blockchain...' : `Uploading to IPFS: ${Math.round(uploadProgress)}%`}
                </Typography>
              </Box>
            </Fade>
          )}
        </Stack>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled"
          elevation={6}
          sx={{ 
            width: '100%',
            borderRadius: 2
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};

export default FlashcardForm;