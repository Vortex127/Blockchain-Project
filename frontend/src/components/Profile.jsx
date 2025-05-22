import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Avatar, 
  Divider, 
  Chip, 
  LinearProgress, 
  Paper, 
  Button,
  useTheme,
  alpha,
  keyframes
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import AddCardIcon from '@mui/icons-material/AddCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const pulse = keyframes`
  0% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled components
const ProfileContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)}, ${alpha(theme.palette.background.default, 0.9)})`,
  borderRadius: theme.shape.borderRadius * 2,
  backdropFilter: 'blur(10px)',
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
    animation: 'rotate 20s linear infinite',
    zIndex: -1
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    background: `radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
    zIndex: -1
  }
}));

const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.9)}, ${alpha(theme.palette.secondary.dark, 0.7)})`,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(4),
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    background: `radial-gradient(circle at 80% 80%, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 50%)`,
    zIndex: 0
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    zIndex: 1,
    animation: 'pulse 2s infinite alternate'
  }
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  height: '100%',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    zIndex: 1
  }
}));
const Profile = ({ account, stats }) => {
  const theme = useTheme();
  
  // Default stats if not provided
  const defaultStats = {
    totalCards: 0,
    totalDecks: 0,
    masteryLevel: 0,
    streak: 0
  };
  
  const [profileStats, setProfileStats] = useState(stats || defaultStats);
  
  return (
    <ProfileContainer>
      <ProfileHeader elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <motion.div 
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  <Avatar sx={{ 
    width: 80, 
    height: 80, 
    mr: 3, 
    bgcolor: alpha(theme.palette.common.white, 0.2),
    border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
    boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
    position: 'relative',
    '&:after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: '50%',
      boxShadow: `0 0 15px ${alpha(theme.palette.secondary.main, 0.5)}`,
      animation: 'pulse 2s infinite alternate',
      zIndex: -1
    }
  }}>
    <AccountCircleIcon sx={{ fontSize: 60 }} />
  </Avatar>
</motion.div>
          <Box>
            <Typography 
  variant="h4" 
  fontWeight="bold" 
  gutterBottom
  sx={{
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block'
  }}
>
  {account?.name || 'Anonymous User'}
</Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {account?.address || '0x000...0000'}
            </Typography>
            <Chip 
              label={`${profileStats.streak} Day Streak`} 
              color="secondary" 
              sx={{ 
                fontWeight: 'bold',
                background: alpha(theme.palette.common.white, 0.2),
                backdropFilter: 'blur(5px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
              }} 
            />
          </Box>
        </Box>
      </ProfileHeader>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <StatsCard>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Your Learning Stats
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {profileStats.totalCards}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Flashcards
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="secondary">
                    {profileStats.totalDecks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Decks
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Mastery Level
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={profileStats.masteryLevel} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                      }
                    }} 
                  />
                  <Typography variant="body2" align="right" sx={{ mt: 0.5 }}>
                    {profileStats.masteryLevel}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </StatsCard>
          
          <StatsCard sx={{ mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddCardIcon />}
                  sx={{ py: 2 }}
                >
                  New Flashcard
                </Button>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="secondary" 
                  startIcon={<CollectionsBookmarkIcon />}
                  sx={{ py: 2 }}
                >
                  New Deck
                </Button>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<TrendingUpIcon />}
                  sx={{ py: 2 }}
                >
                  View Progress
                </Button>
              </Grid>
            </Grid>
          </StatsCard>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <StatsCard>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Achievements
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No achievements yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Complete flashcards to earn achievements
              </Typography>
            </Box>
          </StatsCard>
        </Grid>
      </Grid>
    </ProfileContainer>
  );
};

export default Profile;