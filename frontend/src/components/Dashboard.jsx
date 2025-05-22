import { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  Avatar, 
  Chip, 
  LinearProgress,
  useTheme,
  alpha,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { 
  AddCard as AddCardIcon, 
  CollectionsBookmark as CollectionsBookmarkIcon, 
  AccountBox as AccountBoxIcon,
  TrendingUp as TrendingUpIcon,
  Bolt as BoltIcon,
  EmojiEvents as EmojiEventsIcon,
  MoreHoriz as MoreHorizIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon
} from '@mui/icons-material';

// Styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)}, ${alpha(theme.palette.background.default, 0.9)})`,
  borderRadius: theme.shape.borderRadius * 2,
  backdropFilter: 'blur(10px)',
  minHeight: '100vh'
}));

const WelcomeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.8)}, ${alpha(theme.palette.primary.main, 0.6)})`,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(4)
}));

const ActionCard = styled(motion.div)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  }
}));

const IconContainer = styled(Box)(({ theme, color }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.8)}, ${alpha(theme.palette[color].dark, 0.8)})`,
  boxShadow: `0 4px 20px ${alpha(theme.palette[color].main, 0.3)}`,
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: 30,
    color: theme.palette.common.white
  }
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  height: '100%'
}));

const RecentActivityCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  marginTop: theme.spacing(4)
}));

const ActivityItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  '&:last-child': {
    borderBottom: 'none'
  }
}));

const LeaderboardCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  height: '100%'
}));

const LeaderboardItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.05)
  }
}));

const GlowingButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1, 3),
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
  position: 'relative',
  overflow: 'hidden',
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
  '&:hover': {
    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
    '&:before': {
      left: '100%',
    }
  }
}));

// Animated background pattern
const BackgroundPattern = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 40 + 10,
            height: Math.random() * 40 + 10,
            borderRadius: '50%',
            background: theme.palette.primary.main,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 100 - 50],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </Box>
  );
};

const Dashboard = ({ onCreateFlashcard, onCreateDeck, onViewProfile }) => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalCards: 0,
    totalDecks: 0,
    masteryLevel: 0,
    streak: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Simulate loading data
  useEffect(() => {
    // Simulate stats
    setStats({
      totalCards: 42,
      totalDecks: 7,
      masteryLevel: 68,
      streak: 5
    });
    
    // Simulate recent activity
    setRecentActivity([
      { id: 1, type: 'created', item: 'Web3 Fundamentals Flashcard', time: '2 hours ago', icon: <AddCardIcon color="primary" /> },
      { id: 2, type: 'completed', item: 'Blockchain Basics Deck', time: '1 day ago', icon: <BoltIcon color="success" /> },
      { id: 3, type: 'shared', item: 'Smart Contracts Deck', time: '3 days ago', icon: <ShareIcon color="info" /> },
      { id: 4, type: 'viewed', item: 'DeFi Concepts Flashcard', time: '5 days ago', icon: <VisibilityIcon color="secondary" /> },
    ]);
    
    // Simulate leaderboard
    setLeaderboard([
      { id: 1, name: 'Alex', address: '0x71...3e4f', score: 1250, avatar: '/placeholder.svg?height=40&width=40' },
      { id: 2, name: 'Taylor', address: '0x8f...2e3d', score: 980, avatar: '/placeholder.svg?height=40&width=40' },
      { id: 3, name: 'Jordan', address: '0x3a...9c7b', score: 820, avatar: '/placeholder.svg?height=40&width=40' },
      { id: 4, name: 'You', address: '0x6d...1f4a', score: 760, avatar: '/placeholder.svg?height=40&width=40', isCurrentUser: true },
      { id: 5, name: 'Morgan', address: '0x2c...7b5d', score: 650, avatar: '/placeholder.svg?height=40&width=40' },
    ]);
  }, []);

  const dashboardActions = [
    {
      title: 'Create Flashcard',
      description: 'Create a new flashcard with questions and answers',
      icon: <AddCardIcon />,
      onClick: onCreateFlashcard,
      color: 'primary',
      buttonText: 'Create Now'
    },
    {
      title: 'Create Deck',
      description: 'Organize your flashcards into a themed deck',
      icon: <CollectionsBookmarkIcon />,
      onClick: onCreateDeck,
      color: 'secondary',
      buttonText: 'New Deck'
    },
    {
      title: 'My Profile',
      description: 'View your profile and flashcard statistics',
      icon: <AccountBoxIcon />,
      onClick: onViewProfile,
      color: 'info',
      buttonText: 'View Profile'
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <DashboardContainer>
      <WelcomeCard elevation={0}>
        <BackgroundPattern />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome to Cogni.ai
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, maxWidth: '80%' }}>
            Your decentralized flashcard learning platform. Create, store, and prove ownership of your knowledge on the blockchain.
          </Typography>
          <Chip 
            label={`${stats.streak} Day Streak!`} 
            color="secondary" 
            icon={<BoltIcon />} 
            sx={{ 
              fontWeight: 'bold',
              background: alpha(theme.palette.common.white, 0.2),
              backdropFilter: 'blur(5px)',
              border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
              '& .MuiChip-icon': { color: 'inherit' }
            }} 
          />
        </Box>
      </WelcomeCard>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {dashboardActions.map((action, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div variants={itemVariants}>
                    <ActionCard
                      whileHover={{ 
                        y: -5,
                        boxShadow: `0 20px 40px ${alpha(theme.palette[action.color].main, 0.2)}`
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                          <IconContainer color={action.color}>
                            {action.icon}
                          </IconContainer>
                        </Box>
                        <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, flexGrow: 1 }}>
                          {action.description}
                        </Typography>
                        <GlowingButton 
                          fullWidth 
                          onClick={action.onClick}
                          sx={{ 
                            background: `linear-gradient(90deg, ${theme.palette[action.color].main}, ${theme.palette[action.color].dark})`,
                          }}
                        >
                          {action.buttonText}
                        </GlowingButton>
                      </Box>
                    </ActionCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <RecentActivityCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Activity
                </Typography>
                <IconButton size="small">
                  <MoreHorizIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id}>
                  <Avatar sx={{ bgcolor: 'action.hover', mr: 2 }}>
                    {activity.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {activity.type === 'created' && 'Created new'}
                      {activity.type === 'completed' && 'Completed studying'}
                      {activity.type === 'shared' && 'Shared your'}
                      {activity.type === 'viewed' && 'Viewed'}
                      {' '}
                      <Typography component="span" fontWeight="bold" color="primary">
                        {activity.item}
                      </Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </ActivityItem>
              ))}
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button color="primary" size="small">
                  View All Activity
                </Button>
              </Box>
            </RecentActivityCard>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={6} md={12}>
                <motion.div variants={itemVariants}>
                  <StatsCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mr: 1 }}>
                        <AddCardIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        Your Stats
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" fontWeight="bold" color="primary">
                            {stats.totalCards}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Flashcards
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" fontWeight="bold" color="secondary">
                            {stats.totalDecks}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Decks
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2">Mastery Level</Typography>
                        <Typography variant="body2" fontWeight="bold">{stats.masteryLevel}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={stats.masteryLevel} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                          }
                        }} 
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button 
                        startIcon={<TrendingUpIcon />} 
                        color="primary" 
                        size="small"
                        onClick={onViewProfile}
                      >
                        View Detailed Stats
                      </Button>
                    </Box>
                  </StatsCard>
                </motion.div>
              </Grid>
              
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <LeaderboardCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, mr: 1 }}>
                        <EmojiEventsIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        Leaderboard
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    {leaderboard.map((user, index) => (
                      <LeaderboardItem key={user.id}>
                        <Typography variant="body2" fontWeight="medium" sx={{ width: 24, mr: 1 }}>
                          #{index + 1}
                        </Typography>
                        <Avatar src={user.avatar} sx={{ width: 32, height: 32, mr: 1.5 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" fontWeight={user.isCurrentUser ? "bold" : "medium"} color={user.isCurrentUser ? "primary" : "textPrimary"}>
                            {user.name} {user.isCurrentUser && '(You)'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.address}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${user.score} XP`} 
                          size="small" 
                          color={index < 3 ? "warning" : "default"}
                          sx={{ 
                            fontWeight: 'bold',
                            ...(index < 3 && {
                              background: index === 0 
                                ? `linear-gradient(90deg, #FFD700, #FFA500)` 
                                : index === 1 
                                  ? `linear-gradient(90deg, #C0C0C0, #A9A9A9)` 
                                  : `linear-gradient(90deg, #CD7F32, #8B4513)`,
                              color: '#fff'
                            })
                          }} 
                        />
                      </LeaderboardItem>
                    ))}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button color="primary" size="small">
                        View Full Leaderboard
                      </Button>
                    </Box>
                  </LeaderboardCard>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard;