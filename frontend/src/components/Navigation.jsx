import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useState } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Navigation = ({ account, onDisconnect, onNavigate, onBack }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    handleProfileMenuClose();
    onDisconnect();
  };

  // Removed menu items since we're using back navigation
  return (
    <>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Flashcard Vault
          </Typography>

          {account && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {account.slice(0, 6)}...{account.slice(-4)}
              </Typography>
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 2 }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>



      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
      >
        <MenuItem onClick={handleDisconnect}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Disconnect</ListItemText>
        </MenuItem>
      </Menu>

      <Toolbar /> {/* Spacer for fixed AppBar */}
    </>
  );
};

export default Navigation;